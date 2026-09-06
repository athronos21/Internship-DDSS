import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';

/// Full-featured Staff Authentication & Counter Sign-In Screen
class LoginScreen extends StatefulWidget {
  final AuthService authService;
  final ApiService apiService;
  final ValueChanged<UserSession> onLoginSuccess;

  const LoginScreen({
    super.key,
    required this.authService,
    required this.apiService,
    required this.onLoginSuccess,
  });

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _identifierController = TextEditingController(text: 'pharmacist@kaziniya.com');
  final _passwordController = TextEditingController(text: 'Pharma#2026');
  final _pinController = TextEditingController(text: '3456');

  bool _isPinMode = false;
  bool _obscurePassword = true;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    _pinController.dispose();
    super.dispose();
  }

  void _fillPreset({
    required String identifier,
    required String password,
    required String pin,
  }) {
    setState(() {
      _identifierController.text = identifier;
      _passwordController.text = password;
      _pinController.text = pin;
      _errorMessage = null;
    });
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final session = await widget.authService.login(
        identifier: _identifierController.text.trim(),
        password: _isPinMode ? null : _passwordController.text,
        pin: _isPinMode ? _pinController.text.trim() : null,
      );

      if (!mounted) return;

      if (session.mustChangePassword) {
        _showChangePasswordDialog(session);
      } else {
        widget.onLoginSuccess(session);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showChangePasswordDialog(UserSession session) {
    final currentPassController = TextEditingController(text: _passwordController.text);
    final newPassController = TextEditingController();
    final newPinController = TextEditingController();
    bool isUpdating = false;
    String? dialogError;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: const Row(
                children: [
                  Icon(Icons.security, color: Color(0xFF2DD4BF)),
                  SizedBox(width: 8),
                  Text(
                    'First-Time Login Security',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Welcome to Kaziniya Drug Store! As required by pharmacy security regulations, you must set a permanent password before dispensing medications.',
                      style: TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                    const SizedBox(height: 14),
                    if (dialogError != null)
                      Container(
                        padding: const EdgeInsets.all(8),
                        margin: const EdgeInsets.only(bottom: 10),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.red.withOpacity(0.5)),
                        ),
                        child: Text(dialogError!, style: const TextStyle(color: Colors.redAccent, fontSize: 11)),
                      ),
                    TextField(
                      controller: currentPassController,
                      obscureText: true,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        labelText: 'Current / Temporary Password',
                        labelStyle: const TextStyle(color: Colors.white60, fontSize: 11),
                        filled: true,
                        fillColor: const Color(0xFF0F172A),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: newPassController,
                      obscureText: true,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        labelText: 'New Password (min 6 characters)',
                        labelStyle: const TextStyle(color: Colors.white60, fontSize: 11),
                        filled: true,
                        fillColor: const Color(0xFF0F172A),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: newPinController,
                      keyboardType: TextInputType.number,
                      maxLength: 4,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        labelText: 'New 4-Digit Quick Terminal PIN (Optional)',
                        labelStyle: const TextStyle(color: Colors.white60, fontSize: 11),
                        counterText: '',
                        filled: true,
                        fillColor: const Color(0xFF0F172A),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                ElevatedButton(
                  onPressed: isUpdating
                      ? null
                      : () async {
                          if (newPassController.text.length < 6) {
                            setDialogState(() => dialogError = 'New password must be at least 6 characters');
                            return;
                          }
                          setDialogState(() {
                            isUpdating = true;
                            dialogError = null;
                          });
                          try {
                            await widget.authService.changePassword(
                              currentPassword: currentPassController.text,
                              newPassword: newPassController.text,
                              newPin: newPinController.text.isNotEmpty ? newPinController.text : null,
                            );
                            if (!mounted) return;
                            Navigator.pop(ctx);
                            widget.onLoginSuccess(widget.authService.currentUser!);
                          } catch (err) {
                            setDialogState(() {
                              isUpdating = false;
                              dialogError = err.toString().replaceFirst('Exception: ', '');
                            });
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0D9488),
                    foregroundColor: Colors.white,
                  ),
                  child: isUpdating
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('SAVE & ENTER POS'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // App Brand Header
                  Center(
                    child: Container(
                      width: 68,
                      height: 68,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF0D9488), Color(0xFF14B8A6)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF0D9488).withOpacity(0.35),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: const Icon(Icons.local_pharmacy, color: Colors.white, size: 36),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'KAZINIYA DRUG STORE',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'ካዚኒያ መድኃኒት መደብር • Mobile Counter POS Terminal',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Color(0xFF2DD4BF),
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Authentication Mode Toggle
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF334155)),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _isPinMode = false),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              decoration: BoxDecoration(
                                color: !_isPinMode ? const Color(0xFF0D9488) : Colors.transparent,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                'Password Login',
                                style: TextStyle(
                                  color: !_isPinMode ? Colors.white : Colors.white60,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _isPinMode = true),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              decoration: BoxDecoration(
                                color: _isPinMode ? const Color(0xFF0D9488) : Colors.transparent,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                'Quick PIN Mode',
                                style: TextStyle(
                                  color: _isPinMode ? Colors.white : Colors.white60,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),

                  // Quick Demo Preset Selection Chips
                  const Text(
                    'DEMO TEST PROFILES (TAP TO AUTO-FILL):',
                    style: TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      ActionChip(
                        avatar: const Icon(Icons.medication, size: 14, color: Color(0xFF2DD4BF)),
                        label: const Text('Pharmacist (Solomon)', style: TextStyle(fontSize: 11, color: Colors.white)),
                        backgroundColor: const Color(0xFF1E293B),
                        side: const BorderSide(color: Color(0xFF0D9488)),
                        onPressed: () => _fillPreset(
                          identifier: 'pharmacist@kaziniya.com',
                          password: 'Pharma#2026',
                          pin: '3456',
                        ),
                      ),
                      ActionChip(
                        avatar: const Icon(Icons.store, size: 14, color: Color(0xFF60A5FA)),
                        label: const Text('Store Owner (Dr. Alemu)', style: TextStyle(fontSize: 11, color: Colors.white)),
                        backgroundColor: const Color(0xFF1E293B),
                        side: const BorderSide(color: Color(0xFF2563EB)),
                        onPressed: () => _fillPreset(
                          identifier: 'admin@kaziniya.com',
                          password: 'Admin#2026',
                          pin: '1234',
                        ),
                      ),
                      ActionChip(
                        avatar: const Icon(Icons.shield, size: 14, color: Color(0xFFFBBF24)),
                        label: const Text('Super Admin (Atronos)', style: TextStyle(fontSize: 11, color: Colors.white)),
                        backgroundColor: const Color(0xFF1E293B),
                        side: const BorderSide(color: Color(0xFFD97706)),
                        onPressed: () => _fillPreset(
                          identifier: 'athronos21@gmail.com',
                          password: '12242144',
                          pin: '2144',
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),

                  // Error Banner
                  if (_errorMessage != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      margin: const EdgeInsets.only(bottom: 14),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.red.withOpacity(0.5)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline, color: Colors.redAccent, size: 18),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _errorMessage!,
                              style: const TextStyle(color: Colors.redAccent, fontSize: 12),
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Identifier Input (Work Email or Employee ID)
                  TextFormField(
                    controller: _identifierController,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      labelText: 'Work Email or Employee ID (e.g., KZN-PH-002)',
                      labelStyle: const TextStyle(color: Colors.white60, fontSize: 11),
                      prefixIcon: const Icon(Icons.badge_outlined, color: Color(0xFF2DD4BF), size: 18),
                      filled: true,
                      fillColor: const Color(0xFF1E293B),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFF334155)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFF334155)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFF0D9488), width: 1.5),
                      ),
                    ),
                    validator: (val) {
                      if (val == null || val.trim().isEmpty) {
                        return 'Please enter your email or Employee ID';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),

                  // Password or PIN Input
                  if (!_isPinMode)
                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        labelText: 'Password',
                        labelStyle: const TextStyle(color: Colors.white60, fontSize: 11),
                        prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF2DD4BF), size: 18),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? Icons.visibility_off : Icons.visibility,
                            color: Colors.white54,
                            size: 18,
                          ),
                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        ),
                        filled: true,
                        fillColor: const Color(0xFF1E293B),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFF334155)),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFF334155)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFF0D9488), width: 1.5),
                        ),
                      ),
                      validator: (val) {
                        if (val == null || val.isEmpty) {
                          return 'Please enter your password';
                        }
                        return null;
                      },
                    )
                  else
                    TextFormField(
                      controller: _pinController,
                      keyboardType: TextInputType.number,
                      maxLength: 4,
                      obscureText: true,
                      style: const TextStyle(color: Colors.white, fontSize: 16, letterSpacing: 8),
                      textAlign: TextAlign.center,
                      decoration: InputDecoration(
                        labelText: '4-Digit Terminal PIN',
                        labelStyle: const TextStyle(color: Colors.white60, fontSize: 11),
                        counterText: '',
                        prefixIcon: const Icon(Icons.dialpad, color: Color(0xFF2DD4BF), size: 18),
                        filled: true,
                        fillColor: const Color(0xFF1E293B),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFF334155)),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFF334155)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFF0D9488), width: 1.5),
                        ),
                      ),
                      validator: (val) {
                        if (val == null || val.trim().length != 4) {
                          return 'Enter 4-digit numeric PIN';
                        }
                        return null;
                      },
                    ),
                  const SizedBox(height: 20),

                  // Sign In Submit Button
                  ElevatedButton(
                    onPressed: _isLoading ? null : _handleLogin,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0D9488),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 2,
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                          )
                        : Text(
                            _isPinMode ? 'UNLOCK POS TERMINAL' : 'SIGN IN TO DISPENSARY',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.8,
                            ),
                          ),
                  ),
                  const SizedBox(height: 16),

                  // EFDA & Regulatory Compliance Footer
                  const Center(
                    child: Text(
                      'EFDA Dispensary Compliance • Dual-Audit Protected',
                      style: TextStyle(color: Colors.white38, fontSize: 10),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
