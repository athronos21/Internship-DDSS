import 'package:flutter/material.dart';
import 'services/api_service.dart';
import 'services/auth_service.dart';
import 'screens/login_screen.dart';
import 'screens/pos_screen.dart';
import 'screens/register_medicine_screen.dart';
import 'screens/scan_and_sell.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const KaziniyaMobileApp());
}

class KaziniyaMobileApp extends StatefulWidget {
  const KaziniyaMobileApp({super.key});

  @override
  State<KaziniyaMobileApp> createState() => _KaziniyaMobileAppState();
}

class _KaziniyaMobileAppState extends State<KaziniyaMobileApp> {
  final ApiService _apiService = ApiService();
  late final AuthService _authService;
  bool _isCheckingSession = true;

  @override
  void initState() {
    super.initState();
    _authService = AuthService(apiService: _apiService);
    _initializeAuth();
  }

  Future<void> _initializeAuth() async {
    try {
      await _authService.restoreSession();
    } finally {
      if (mounted) {
        setState(() => _isCheckingSession = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _authService,
      builder: (context, _) {
        return MaterialApp(
          title: 'Kaziniya Drug Store POS',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            colorScheme: ColorScheme.fromSeed(
              seedColor: const Color(0xFF0D9488),
              brightness: Brightness.dark,
            ),
            scaffoldBackgroundColor: const Color(0xFF0F172A),
            useMaterial3: true,
            fontFamily: 'Roboto',
          ),
          home: _isCheckingSession
              ? const Scaffold(
                  backgroundColor: Color(0xFF0F172A),
                  body: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.local_pharmacy, color: Color(0xFF2DD4BF), size: 48),
                        SizedBox(height: 16),
                        Text(
                          'KAZINIYA DRUG STORE',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1,
                          ),
                        ),
                        SizedBox(height: 6),
                        Text(
                          'Verifying Dispensary Terminal Security...',
                          style: TextStyle(color: Colors.white60, fontSize: 11),
                        ),
                        SizedBox(height: 20),
                        CircularProgressIndicator(color: Color(0xFF0D9488)),
                      ],
                    ),
                  ),
                )
              : _authService.isAuthenticated
                  ? MainNavigationShell(
                      authService: _authService,
                      apiService: _apiService,
                    )
                  : LoginScreen(
                      authService: _authService,
                      apiService: _apiService,
                      onLoginSuccess: (session) {
                        // Rebuild triggered via AuthService ChangeNotifier
                      },
                    ),
        );
      },
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  final AuthService authService;
  final ApiService apiService;

  const MainNavigationShell({
    super.key,
    required this.authService,
    required this.apiService,
  });

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  void _confirmSignOut() {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.lock_outline, color: Color(0xFFF87171)),
              SizedBox(width: 8),
              Text(
                'Lock POS Terminal?',
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          content: Text(
            'Are you sure you want to lock the counter terminal and sign out ${widget.authService.currentUser?.name ?? 'current staff'}?',
            style: const TextStyle(color: Colors.white70, fontSize: 13),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('CANCEL', style: TextStyle(color: Colors.white60)),
            ),
            ElevatedButton.icon(
              onPressed: () async {
                Navigator.pop(ctx);
                await widget.authService.logout();
              },
              icon: const Icon(Icons.logout, size: 16),
              label: const Text('LOCK & SIGN OUT'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFDC2626),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        );
      },
    );
  }

  void _showStaffProfileModal() {
    final user = widget.authService.currentUser;
    if (user == null) return;

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: const Color(0xFF0D9488),
                      child: Text(
                        user.name.isNotEmpty ? user.name[0].toUpperCase() : 'P',
                        style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user.name,
                            style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            user.email,
                            style: const TextStyle(color: Colors.white60, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: user.isSuperAdmin
                            ? const Color(0xFFD97706).withOpacity(0.2)
                            : user.isOwner
                                ? const Color(0xFF2563EB).withOpacity(0.2)
                                : const Color(0xFF0D9488).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: user.isSuperAdmin
                              ? const Color(0xFFF59E0B)
                              : user.isOwner
                                  ? const Color(0xFF3B82F6)
                                  : const Color(0xFF14B8A6),
                        ),
                      ),
                      child: Text(
                        user.role,
                        style: TextStyle(
                          color: user.isSuperAdmin
                              ? const Color(0xFFFBBF24)
                              : user.isOwner
                                  ? const Color(0xFF60A5FA)
                                  : const Color(0xFF2DD4BF),
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const Divider(color: Colors.white24, height: 24),
                _buildProfileDetailRow('Employee ID', user.employeeId.isNotEmpty ? user.employeeId : 'KZN-STAFF'),
                _buildProfileDetailRow('Assigned Department', user.department.isNotEmpty ? user.department : 'Dispensary & POS'),
                _buildProfileDetailRow('Store Name', user.pharmacyName),
                _buildProfileDetailRow('Security Status', 'Active & Audit Authenticated'),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(ctx);
                      _confirmSignOut();
                    },
                    icon: const Icon(Icons.logout, size: 16),
                    label: const Text('END SHIFT / LOCK TERMINAL'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFDC2626),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildProfileDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.between,
        children: [
          Text(label, style: const TextStyle(color: Colors.white54, fontSize: 12)),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = widget.authService.currentUser;

    final screens = [
      // 1. POS Counter Terminal with authenticated session
      PosScreen(
        apiService: widget.apiService,
        userSession: user,
        onOpenScanner: () => setState(() => _currentIndex = 2),
      ),
      // 2. Register Product (Visual Scan & Manual)
      RegisterMedicineScreen(
        apiService: widget.apiService,
        onMedicineAdded: () {
          setState(() => _currentIndex = 0);
        },
      ),
      // 3. Visual Packaging Scanner & FEFO Batch Dispenser
      ScanAndSellScreen(
        apiService: widget.apiService,
      ),
    ];

    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(48),
        child: Container(
          decoration: const BoxDecoration(
            color: Color(0xFF0F172A),
            border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
          ),
          child: SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              child: Row(
                children: [
                  const Icon(Icons.local_pharmacy, color: Color(0xFF2DD4BF), size: 18),
                  const SizedBox(width: 8),
                  const Text(
                    'KAZINIYA',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13, letterSpacing: 0.8),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF042F2E),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: const Color(0xFF0D9488)),
                    ),
                    child: const Text('BOLE MEDHANEALEM', style: TextStyle(color: Color(0xFF5EEAD4), fontSize: 9, fontWeight: FontWeight.bold)),
                  ),
                  const Spacer(),
                  if (user != null)
                    InkWell(
                      onTap: _showStaffProfileModal,
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFF334155)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            CircleAvatar(
                              radius: 9,
                              backgroundColor: const Color(0xFF0D9488),
                              child: Text(
                                user.name.isNotEmpty ? user.name[0].toUpperCase() : 'S',
                                style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              user.name.split(' ').last,
                              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(width: 4),
                            const Icon(Icons.keyboard_arrow_down, color: Colors.white54, size: 14),
                          ],
                        ),
                      ),
                    ),
                  const SizedBox(width: 6),
                  IconButton(
                    icon: const Icon(Icons.lock_outline, color: Color(0xFFF87171), size: 18),
                    tooltip: 'Lock Terminal / Sign Out',
                    visualDensity: VisualDensity.compact,
                    onPressed: _confirmSignOut,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      body: screens[_currentIndex],
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          border: Border(top: BorderSide(color: Color(0xFF334155))),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          backgroundColor: Colors.transparent,
          elevation: 0,
          selectedItemColor: const Color(0xFF2DD4BF),
          unselectedItemColor: Colors.white60,
          selectedFontSize: 11,
          unselectedFontSize: 10,
          type: BottomNavigationBarType.fixed,
          onTap: (index) => setState(() => _currentIndex = index),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.point_of_sale),
              label: 'POS Counter',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.add_circle_outline),
              label: 'Register Drug',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.camera_enhance),
              label: 'Visual Scan',
            ),
          ],
        ),
      ),
    );
  }
}
