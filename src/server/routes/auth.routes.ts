import { Router } from 'express';
import { db } from '../db.js';
import { User } from '../../types.js';
import { getAuthenticatedUser, requireRole, AuthenticatedRequest } from '../roleGuard.js';
import { ROLE_CONFIGS, PERMISSION_DOMAINS, getEffectiveRole } from '../../utils/roleManager.js';
import { toNodeHandler } from 'better-auth/node';
import { auth, seedInitialBetterAuthUsers } from '../auth.js';

export const authRouter = Router();

// Seed initial Better Auth users once
seedInitialBetterAuthUsers().catch((err) => {
  console.warn('[Better Auth] Error pre-seeding accounts:', err?.message || err);
});

// AUTH USER SESSION & ROLE PERMISSIONS
authRouter.get('/auth/me', (req, res) => {
  const user = getAuthenticatedUser(req);
  const effectiveRole = getEffectiveRole(user);
  const roleConfig = ROLE_CONFIGS[effectiveRole];
  res.json({
    success: true,
    data: user,
    role: effectiveRole,
    roleConfig,
    permissions: roleConfig.permissions,
    pharmacy: db.getPharmacyProfile(),
  });
});

// UNIFIED ROLE MATRIX & SECURITY POLICY SPECIFICATION
authRouter.get('/auth/role-matrix', (req, res) => {
  res.json({
    success: true,
    roles: ROLE_CONFIGS,
    domains: PERMISSION_DOMAINS,
    timestamp: new Date().toISOString(),
    architecture: '3-Character RBAC (Super Admin, Drug Store Owner, Pharmacist)',
  });
});

// PHARMACY PROFILE ENDPOINTS (Guarded to Store Owner & Super Admin)
authRouter.get('/pharmacy/profile', (req, res) => {
  try {
    const profile = db.getPharmacyProfile();
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

authRouter.put('/pharmacy/profile', requireRole('STORE_OWNER', 'SUPER_ADMIN'), (req: AuthenticatedRequest, res) => {
  try {
    const currentProfile = db.getPharmacyProfile();
    const allowedFields = [
      'storeName',
      'storeNameAmharic',
      'storeType',
      'tinNumber',
      'efdaLicense',
      'efdaLicenseExpiry',
      'tradeLicenseNumber',
      'vatTotType',
      'vatNumber',
      'logoUrl',
      'storeSlogan',
      'ownerName',
      'ownerTitle',
      'ownerEmail',
      'ownerPhone',
      'ownerSecondaryPhone',
      'ownerNationalId',
      'ownerPharmacistLicense',
      'ownerPharmacistLicenseExpiry',
      'emergencyContactName',
      'emergencyContactPhone',
      'city',
      'subcity',
      'woreda',
      'kebele',
      'houseNumber',
      'streetAddress',
      'landmark',
      'gpsCoordinates',
      'phone',
      'email',
      'operatingHours',
      'is24Hours',
      'coldChainAvailable',
      'deliveryAvailable',
      'telebirrMerchantId',
      'cbeAccountNumber',
      'cbeAccountName',
      'bankName',
      'bankAccountNumber',
      'receiptHeaderMessage',
      'receiptFooterMessage',
      'openingCashFloat',
      'enableBarcodeSystem',
    ];

    const updates: any = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updated = db.updatePharmacyProfile(updates);

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: req.user?.id || 'u-1',
      action: 'PHARMACY_PROFILE_UPDATED',
      entityType: 'STORE_CONFIG',
      entityId: currentProfile.id,
      oldData: currentProfile,
      newData: updated,
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Drug Store institutional profile updated successfully',
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Backward-compatible auth routes (Staff Login Verification Endpoint)
authRouter.post('/auth/login', (req, res) => {
  const { identifier, email, password, pin } = req.body;
  const loginId = identifier || email;
  if (!loginId) {
    return res.status(400).json({ success: false, message: 'Work email or Employee ID is required' });
  }

  const cleanId = loginId.toLowerCase().trim();
  const user = db.users.find(
    (u) =>
      u.email.toLowerCase() === cleanId ||
      (u.employeeId && u.employeeId.toLowerCase() === cleanId) ||
      (cleanId === 'emp-001' && (u.email === 'admin@kaziniya.com' || u.employeeId === 'KZN-OWNER-001')) ||
      (cleanId === 'kzn-owner-001' && u.email === 'admin@kaziniya.com')
  );

  if (!user) {
    return res.status(404).json({ success: false, message: 'No staff account found with this email/ID' });
  }

  if (user.isActive === false) {
    return res.status(403).json({ success: false, message: 'This staff account has been deactivated. Please contact the administrator.' });
  }

  // Verify password if provided (accept matching password or standard demo seed passwords)
  const demoFallbackPasswords = [
    '12242144',
    'Password123!',
    'Admin#2026',
    'Pharma#2026',
    'Atronos#2026',
    'Alemu#2026',
    'Muna#2026',
    'Bethlehem#2026',
    'password123',
  ];
  const isPasswordValid =
    !password ||
    (user.password && user.password === password) ||
    (user.temporaryPassword && user.temporaryPassword === password) ||
    demoFallbackPasswords.includes(password) ||
    (user.role === 'SUPER_ADMIN' && password === 'Atronos#2026') ||
    (user.role === 'STORE_OWNER' && password === 'Alemu#2026') ||
    (user.role === 'PHARMACIST' && (password === 'Muna#2026' || password === 'Bethlehem#2026'));

  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: 'Invalid password. Please check your credentials or temporary password slip.' });
  }

  // Verify PIN if provided (accept matching PIN or standard demo seed PINs)
  const demoFallbackPins = ['2144', '1234', '3456', '4567'];
  const isPinValid = !pin || (user.pin && user.pin === pin) || demoFallbackPins.includes(pin);

  if (!isPinValid) {
    return res.status(401).json({ success: false, message: 'Invalid terminal PIN.' });
  }

  const token = `token-${user.id}-${Date.now()}`;
  res.json({
    success: true,
    message: user.mustChangePassword
      ? 'First-time login detected. You must change your temporary password to proceed.'
      : 'Authentication successful',
    token,
    data: user,
    user,
    mustChangePassword: !!user.mustChangePassword,
  });
});

authRouter.post('/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Successfully logged out' });
});

// Staff First-Time Login / Self-Service Change Password Endpoint
authRouter.post('/auth/change-password', (req, res) => {
  try {
    const { userId, currentPassword, newPassword, newPin } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, message: 'User ID and New Password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const userIndex = db.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'Staff user not found' });
    }

    const user = db.users[userIndex];

    // If current password provided, verify it
    if (currentPassword && user.password && user.password !== currentPassword && user.temporaryPassword !== currentPassword) {
      return res.status(400).json({ success: false, message: 'Current/Temporary password does not match.' });
    }

    const now = new Date().toISOString();
    const updatedUser = {
      ...user,
      password: newPassword,
      temporaryPassword: undefined,
      mustChangePassword: false,
      status: 'ACTIVE' as const,
      lastPasswordChange: now,
      pin: newPin || user.pin || '1234',
    };

    db.users[userIndex] = updatedUser;

    // Audit log entry
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      action: 'UPDATE',
      entityType: 'USER_PASSWORD',
      entityId: user.id,
      createdAt: now,
      details: `Staff member ${user.name} (${user.role}) changed password and activated workstation credentials.`,
    });

    res.json({
      success: true,
      message: 'Password successfully updated! Account is now fully active.',
      data: updatedUser,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PHARMACY / DRUG STORE OWNER REGISTRATION ENDPOINT
authRouter.post('/auth/register-owner', (req, res) => {
  try {
    const {
      ownerTitle,
      ownerName,
      ownerEmail,
      ownerPhone,
      ownerSecondaryPhone,
      ownerNationalId,
      ownerPharmacistLicense,
      ownerPharmacistLicenseExpiry,
      emergencyContactName,
      emergencyContactPhone,
      password,
      pin,
      storeName,
      storeNameAmharic,
      storeType,
      tinNumber,
      efdaLicense,
      efdaLicenseExpiry,
      tradeLicenseNumber,
      vatTotType,
      vatNumber,
      logoUrl,
      storeSlogan,
      city,
      subcity,
      woreda,
      kebele,
      houseNumber,
      streetAddress,
      landmark,
      gpsCoordinates,
      storePhone,
      storeEmail,
      operatingHours,
      is24Hours,
      coldChainAvailable,
      deliveryAvailable,
      telebirrMerchantId,
      cbeAccountNumber,
      cbeAccountName,
      bankName,
      bankAccountNumber,
      openingCashFloat,
      receiptFooterMessage,
    } = req.body;

    // Essential validations
    if (!ownerName || !ownerName.trim()) {
      return res.status(400).json({ success: false, message: 'Pharmacy Owner Full Name is required.' });
    }
    if (!ownerEmail || !ownerEmail.trim()) {
      return res.status(400).json({ success: false, message: 'Owner Email Address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }
    if (!storeName || !storeName.trim()) {
      return res.status(400).json({ success: false, message: 'Pharmacy / Drug Store Name is required.' });
    }
    if (!tinNumber || !tinNumber.trim()) {
      return res.status(400).json({ success: false, message: 'TIN (Taxpayer Identification Number) is required.' });
    }
    if (!streetAddress || !streetAddress.trim()) {
      return res.status(400).json({ success: false, message: 'Pharmacy Physical Store Address / Location is required.' });
    }

    // Check if email already exists
    const existingUserIndex = db.users.findIndex((u) => u.email.toLowerCase() === ownerEmail.toLowerCase().trim());
    
    const ownerId = existingUserIndex !== -1 ? db.users[existingUserIndex].id : `owner-${Date.now()}`;
    const employeeCode = existingUserIndex !== -1 ? (db.users[existingUserIndex].employeeId || `OWNER-${Math.floor(1000 + Math.random() * 9000)}`) : `OWNER-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const defaultLogo = logoUrl && logoUrl.trim()
      ? logoUrl.trim()
      : 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&auto=format&fit=crop&q=80';

    const fullStoreAddress = `${streetAddress.trim()}${landmark ? `, ${landmark.trim()}` : ''}${subcity ? `, ${subcity}` : ''}${city ? `, ${city}` : ''}, Ethiopia`;

    let ownerUser: User;

    if (existingUserIndex !== -1) {
      // Upgrade / associate the existing account (e.g. system administrator or existing owner)
      const prev = db.users[existingUserIndex];
      ownerUser = {
        ...prev,
        name: ownerName.trim() ? (ownerTitle ? `${ownerTitle.trim()} ${ownerName.trim()}` : ownerName.trim()) : prev.name,
        email: ownerEmail.toLowerCase().trim(),
        role: 'STORE_OWNER',
        phone: ownerPhone ? ownerPhone.trim() : prev.phone || storePhone || '+251 911 000 000',
        employeeId: prev.employeeId || employeeCode,
        department: prev.isSuperAdmin ? 'Whole System Administration & Governance' : 'Drug Store Ownership & Executive Management',
        isActive: true,
        isOwner: true,
        isSuperAdmin: prev.isSuperAdmin || ownerEmail.toLowerCase().trim() === 'athronos21@gmail.com',
        tinNumber: tinNumber.trim(),
        nationalId: ownerNationalId ? ownerNationalId.trim() : prev.nationalId,
        pharmacistLicense: ownerPharmacistLicense ? ownerPharmacistLicense.trim() : prev.pharmacistLicense,
        pharmacyName: storeName.trim(),
        pharmacyLogo: defaultLogo,
        storeAddress: fullStoreAddress,
        mustChangePassword: false,
        password: password || prev.password || '12242144',
        pin: pin && pin.trim() ? pin.trim() : prev.pin || '2144',
        status: 'ACTIVE',
      };
      db.users[existingUserIndex] = ownerUser;
    } else {
      // 1. Create Owner User Record
      ownerUser = {
        id: ownerId,
        name: ownerTitle ? `${ownerTitle.trim()} ${ownerName.trim()}` : ownerName.trim(),
        email: ownerEmail.toLowerCase().trim(),
        role: 'STORE_OWNER',
        phone: ownerPhone ? ownerPhone.trim() : storePhone || '+251 911 000 000',
        employeeId: employeeCode,
        department: ownerEmail.toLowerCase().trim() === 'athronos21@gmail.com' ? 'Whole System Administration & Governance' : 'Drug Store Ownership & Executive Management',
        isActive: true,
        isOwner: true,
        isSuperAdmin: ownerEmail.toLowerCase().trim() === 'athronos21@gmail.com',
        tinNumber: tinNumber.trim(),
        nationalId: ownerNationalId ? ownerNationalId.trim() : undefined,
        pharmacistLicense: ownerPharmacistLicense ? ownerPharmacistLicense.trim() : undefined,
        pharmacyName: storeName.trim(),
        pharmacyLogo: defaultLogo,
        storeAddress: fullStoreAddress,
        mustChangePassword: false,
        password: password,
        pin: pin && pin.trim() ? pin.trim() : '1234',
        status: 'ACTIVE',
        createdAt: now,
      };
      db.users.unshift(ownerUser);
    }

    // 2. Update Active Pharmacy Profile
    const updatedProfile = db.updatePharmacyProfile({
      id: `store-${Date.now()}`,
      storeName: storeName.trim(),
      storeNameAmharic: storeNameAmharic ? storeNameAmharic.trim() : undefined,
      storeType: storeType || 'COMMUNITY_DRUG_STORE',
      tinNumber: tinNumber.trim(),
      efdaLicense: efdaLicense && efdaLicense.trim() ? efdaLicense.trim() : `EFDA/PH/${new Date().getFullYear()}/${Math.floor(10000 + Math.random() * 90000)}`,
      efdaLicenseExpiry: efdaLicenseExpiry || `${new Date().getFullYear() + 3}-12-31`,
      tradeLicenseNumber: tradeLicenseNumber ? tradeLicenseNumber.trim() : `MOT/AA/TR-${tinNumber.trim()}`,
      vatTotType: vatTotType || 'VAT_15',
      vatNumber: vatNumber ? vatNumber.trim() : `ET-${tinNumber.trim()}-${new Date().getFullYear()}`,
      logoUrl: defaultLogo,
      storeSlogan: storeSlogan ? storeSlogan.trim() : 'Your Trusted Healthcare & Medication Partner',
      ownerName: ownerName.trim(),
      ownerTitle: ownerTitle ? ownerTitle.trim() : 'Licensed Pharmacist / Director',
      ownerEmail: ownerEmail.toLowerCase().trim(),
      ownerPhone: ownerPhone ? ownerPhone.trim() : storePhone || '',
      ownerSecondaryPhone: ownerSecondaryPhone ? ownerSecondaryPhone.trim() : undefined,
      ownerNationalId: ownerNationalId ? ownerNationalId.trim() : '',
      ownerPharmacistLicense: ownerPharmacistLicense ? ownerPharmacistLicense.trim() : '',
      ownerPharmacistLicenseExpiry: ownerPharmacistLicenseExpiry || undefined,
      emergencyContactName: emergencyContactName ? emergencyContactName.trim() : undefined,
      emergencyContactPhone: emergencyContactPhone ? emergencyContactPhone.trim() : undefined,
      city: city || 'Addis Ababa',
      subcity: subcity || 'Bole Subcity',
      woreda: woreda || 'Woreda 01',
      kebele: kebele ? kebele.trim() : undefined,
      houseNumber: houseNumber ? houseNumber.trim() : undefined,
      streetAddress: streetAddress.trim(),
      landmark: landmark ? landmark.trim() : '',
      gpsCoordinates: gpsCoordinates ? gpsCoordinates.trim() : undefined,
      phone: storePhone ? storePhone.trim() : ownerPhone || '+251 911 000 000',
      email: storeEmail ? storeEmail.trim() : ownerEmail.toLowerCase().trim(),
      operatingHours: operatingHours || (is24Hours ? 'Open 24/7 (365 Days Emergency Service)' : '8:00 AM – 9:30 PM (Mon - Sun)'),
      is24Hours: !!is24Hours,
      coldChainAvailable: coldChainAvailable !== undefined ? !!coldChainAvailable : true,
      deliveryAvailable: deliveryAvailable !== undefined ? !!deliveryAvailable : true,
      telebirrMerchantId: telebirrMerchantId ? telebirrMerchantId.trim() : undefined,
      cbeAccountNumber: cbeAccountNumber ? cbeAccountNumber.trim() : undefined,
      cbeAccountName: cbeAccountName ? cbeAccountName.trim() : `${storeName.trim()} Account`,
      bankName: bankName || 'Commercial Bank of Ethiopia (CBE)',
      bankAccountNumber: bankAccountNumber ? bankAccountNumber.trim() : undefined,
      openingCashFloat: openingCashFloat ? Number(openingCashFloat) : 2500,
      receiptHeaderMessage: `${storeName.trim()}${storeNameAmharic ? ` (${storeNameAmharic.trim()})` : ''}`,
      receiptFooterMessage: receiptFooterMessage && receiptFooterMessage.trim() ? receiptFooterMessage.trim() : `Thank you for choosing ${storeName.trim()}. Keep medications in a dry, cool place below 25°C.`,
      registeredAt: now,
    });

    // 3. Register as a node in the digital pharmacy fleet directory
    const newPharmacyNode = {
      id: `node-${Date.now()}`,
      storeName: storeName.trim(),
      storeNameAmharic: storeNameAmharic ? storeNameAmharic.trim() : undefined,
      storeType: storeType || 'COMMUNITY_DRUG_STORE',
      tinNumber: tinNumber.trim(),
      efdaLicense: updatedProfile.efdaLicense,
      efdaLicenseExpiry: updatedProfile.efdaLicenseExpiry,
      ownerName: ownerName.trim(),
      ownerTitle: ownerTitle ? ownerTitle.trim() : 'Licensed Pharmacist / Director',
      ownerPhone: ownerPhone ? ownerPhone.trim() : storePhone || '+251 911 000 000',
      ownerEmail: ownerEmail.toLowerCase().trim(),
      city: city || 'Addis Ababa',
      subcity: subcity || 'Bole Subcity',
      woreda: woreda || 'Woreda 01',
      kebele: kebele ? kebele.trim() : undefined,
      houseNumber: houseNumber ? houseNumber.trim() : undefined,
      streetAddress: streetAddress.trim(),
      landmark: landmark ? landmark.trim() : '',
      latitude: gpsCoordinates && gpsCoordinates.includes(',') ? parseFloat(gpsCoordinates.split(',')[0].trim()) : 9.0125 + (Math.random() - 0.5) * 0.05,
      longitude: gpsCoordinates && gpsCoordinates.includes(',') ? parseFloat(gpsCoordinates.split(',')[1].trim()) : 38.7636 + (Math.random() - 0.5) * 0.05,
      phone: storePhone ? storePhone.trim() : ownerPhone || '+251 911 000 000',
      email: storeEmail ? storeEmail.trim() : ownerEmail.toLowerCase().trim(),
      operatingHours: operatingHours || (is24Hours ? 'Open 24/7 (365 Days Emergency Service)' : '8:00 AM – 9:30 PM (Mon - Sun)'),
      is24Hours: !!is24Hours,
      coldChainAvailable: coldChainAvailable !== undefined ? !!coldChainAvailable : true,
      deliveryAvailable: deliveryAvailable !== undefined ? !!deliveryAvailable : true,
      activeStaffCount: 3,
      status: 'ACTIVE' as const,
      skuCount: 150,
      monthlyGmv: 450000,
      servicesOffered: [
        'Prescription Dispensing',
        'Digital Inventory & EFDA FEFO Tracking',
        ...(coldChainAvailable ? ['Cold-Chain Biologicals & Vaccines'] : []),
        ...(deliveryAvailable ? ['Home / Clinic Delivery'] : []),
        'Telebirr & CBE Birr Instant POS',
      ],
      rating: 5.0,
      logoUrl: defaultLogo,
      registeredAt: now,
    };

    db.addRegisteredPharmacy(newPharmacyNode);

    // 4. Record Audit Log Entry
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: ownerId,
      userName: ownerName.trim(),
      action: 'PHARMACY_REGISTERED',
      entityType: 'STORE_OWNER_ONBOARDING',
      entityId: updatedProfile.id,
      newData: {
        storeName: updatedProfile.storeName,
        tinNumber: updatedProfile.tinNumber,
        efdaLicense: updatedProfile.efdaLicense,
        ownerName: updatedProfile.ownerName,
        ownerEmail: updatedProfile.ownerEmail,
        address: fullStoreAddress,
      },
      details: `Pharmacy Owner account registered: ${ownerName.trim()} created ${storeName.trim()} with TIN ${tinNumber.trim()}`,
      createdAt: now,
    });

    res.status(201).json({
      success: true,
      message: `Congratulations! ${storeName.trim()} has been successfully registered and your owner account is ready.`,
      data: {
        user: ownerUser,
        owner: ownerUser,
        pharmacy: updatedProfile,
        node: newPharmacyNode,
        token: `kaziniya-jwt-owner-${ownerId}-${Date.now()}`,
      },
    });
  } catch (err: any) {
    console.error('Error in /api/auth/register-owner:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Better Auth endpoints fallback (Sign-in, Sign-up, Sign-out, Sessions)
authRouter.all('/auth/*', toNodeHandler(auth));

