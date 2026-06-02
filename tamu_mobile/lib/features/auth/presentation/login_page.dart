import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../config/theme.dart';
import '../application/auth_controller.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _namaController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _teleponController = TextEditingController();

  bool _isRegisterMode = false;
  bool _showPassword = false;

  @override
  void dispose() {
    _namaController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _teleponController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final controller = ref.read(authControllerProvider.notifier);
    final ok = _isRegisterMode
        ? await controller.register(
            namaLengkap: _namaController.text,
            email: _emailController.text,
            password: _passwordController.text,
            noTelepon: _teleponController.text,
          )
        : await controller.login(
            email: _emailController.text,
            password: _passwordController.text,
          );

    if (!mounted || !ok) return;
    context.go('/');
  }

  String? _required(String? value, String label) {
    if (value == null || value.trim().isEmpty) {
      return '$label wajib diisi';
    }
    return null;
  }

  String? _emailValidator(String? value) {
    final required = _required(value, 'Email');
    if (required != null) return required;

    final email = value!.trim();
    if (email.length > 30) return 'Email maksimal 30 karakter';
    if (!email.contains('@') || !email.contains('.')) {
      return 'Format email tidak valid';
    }
    return null;
  }

  String? _passwordValidator(String? value) {
    final required = _required(value, 'Kata sandi');
    if (required != null) return required;

    if (_isRegisterMode && value!.length < 8) {
      return 'Kata sandi minimal 8 karakter';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight:
                  MediaQuery.of(context).size.height -
                  MediaQuery.of(context).padding.vertical -
                  48,
            ),
            child: Center(
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Icon(
                      Icons.home_work_rounded,
                      size: 64,
                      color: AppColors.navy,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Wisma Binangkit',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppColors.navy,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _isRegisterMode
                          ? 'Daftar akun tamu untuk mulai memesan unit.'
                          : 'Masuk untuk memesan unit homestay favorit Anda.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: AppColors.grayMuted),
                    ),
                    const SizedBox(height: 28),
                    SegmentedButton<bool>(
                      segments: const [
                        ButtonSegment(value: false, label: Text('Masuk')),
                        ButtonSegment(value: true, label: Text('Daftar')),
                      ],
                      selected: {_isRegisterMode},
                      onSelectionChanged: authState.isLoading
                          ? null
                          : (value) {
                              setState(() {
                                _isRegisterMode = value.first;
                              });
                            },
                    ),
                    const SizedBox(height: 20),
                    Card(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                        side: const BorderSide(color: AppColors.grayBorder),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            if (_isRegisterMode) ...[
                              TextFormField(
                                controller: _namaController,
                                enabled: !authState.isLoading,
                                textInputAction: TextInputAction.next,
                                decoration: const InputDecoration(
                                  labelText: 'Nama Lengkap',
                                  prefixIcon: Icon(Icons.person_outline),
                                ),
                                validator: (value) {
                                  final required = _required(
                                    value,
                                    'Nama lengkap',
                                  );
                                  if (required != null) return required;
                                  if (value!.trim().length > 30) {
                                    return 'Nama lengkap maksimal 30 karakter';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 14),
                            ],
                            TextFormField(
                              controller: _emailController,
                              enabled: !authState.isLoading,
                              keyboardType: TextInputType.emailAddress,
                              textInputAction: TextInputAction.next,
                              decoration: const InputDecoration(
                                labelText: 'Email',
                                prefixIcon: Icon(Icons.email_outlined),
                              ),
                              validator: _emailValidator,
                            ),
                            const SizedBox(height: 14),
                            TextFormField(
                              controller: _passwordController,
                              enabled: !authState.isLoading,
                              obscureText: !_showPassword,
                              textInputAction: _isRegisterMode
                                  ? TextInputAction.next
                                  : TextInputAction.done,
                              decoration: InputDecoration(
                                labelText: 'Kata Sandi',
                                prefixIcon: const Icon(Icons.lock_outline),
                                suffixIcon: IconButton(
                                  onPressed: () {
                                    setState(() {
                                      _showPassword = !_showPassword;
                                    });
                                  },
                                  icon: Icon(
                                    _showPassword
                                        ? Icons.visibility_off_outlined
                                        : Icons.visibility_outlined,
                                  ),
                                ),
                              ),
                              validator: _passwordValidator,
                              onFieldSubmitted: (_) {
                                if (!_isRegisterMode) _submit();
                              },
                            ),
                            if (_isRegisterMode) ...[
                              const SizedBox(height: 14),
                              TextFormField(
                                controller: _teleponController,
                                enabled: !authState.isLoading,
                                keyboardType: TextInputType.phone,
                                textInputAction: TextInputAction.done,
                                decoration: const InputDecoration(
                                  labelText: 'Nomor Telepon',
                                  prefixIcon: Icon(Icons.phone_outlined),
                                ),
                                validator: (value) {
                                  final required = _required(
                                    value,
                                    'Nomor telepon',
                                  );
                                  if (required != null) return required;
                                  if (value!.trim().length > 15) {
                                    return 'Nomor telepon maksimal 15 karakter';
                                  }
                                  return null;
                                },
                                onFieldSubmitted: (_) => _submit(),
                              ),
                            ],
                            if (authState.errorMessage != null) ...[
                              const SizedBox(height: 14),
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: AppColors.merah.withValues(
                                    alpha: 0.08,
                                  ),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppColors.merah),
                                ),
                                child: Text(
                                  authState.errorMessage!,
                                  style: const TextStyle(
                                    color: AppColors.merah,
                                  ),
                                ),
                              ),
                            ],
                            const SizedBox(height: 18),
                            ElevatedButton(
                              onPressed: authState.isLoading ? null : _submit,
                              child: authState.isLoading
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: AppColors.card,
                                      ),
                                    )
                                  : Text(
                                      _isRegisterMode
                                          ? 'Daftar Sekarang'
                                          : 'Masuk',
                                    ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
