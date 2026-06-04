import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../config/theme.dart';
import '../../../shared/widgets/wisma_brand_mark.dart';
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
  String? _successMessage;

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

    setState(() {
      _successMessage = null;
    });

    final controller = ref.read(authControllerProvider.notifier);
    final isRegister = _isRegisterMode;
    final ok = isRegister
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

    if (isRegister) {
      setState(() {
        _isRegisterMode = false;
        _successMessage =
            'Akun berhasil dibuat. Silakan masuk dengan email dan kata sandi Anda.';
        _namaController.clear();
        _passwordController.clear();
        _teleponController.clear();
      });
      return;
    }

    context.go('/');
  }

  void _setMode(bool isRegisterMode) {
    setState(() {
      _isRegisterMode = isRegisterMode;
      _successMessage = null;
    });
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
          padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 10),
                const WismaBrandMark(),
                const SizedBox(height: 22),
                _WelcomePanel(isRegisterMode: _isRegisterMode),
                const SizedBox(height: 16),
                _AuthModeSwitch(
                  isRegisterMode: _isRegisterMode,
                  isDisabled: authState.isLoading,
                  onChanged: _setMode,
                ),
                const SizedBox(height: 16),
                _AuthFormCard(
                  isRegisterMode: _isRegisterMode,
                  isLoading: authState.isLoading,
                  showPassword: _showPassword,
                  namaController: _namaController,
                  emailController: _emailController,
                  passwordController: _passwordController,
                  teleponController: _teleponController,
                  onTogglePassword: () {
                    setState(() {
                      _showPassword = !_showPassword;
                    });
                  },
                  onSubmit: _submit,
                  onForgotPassword: () => context.push('/lupa-password'),
                  requiredValidator: _required,
                  emailValidator: _emailValidator,
                  passwordValidator: _passwordValidator,
                ),
                if (authState.errorMessage != null) ...[
                  const SizedBox(height: 14),
                  _MessageBox(message: authState.errorMessage!, isError: true),
                ],
                if (_successMessage != null) ...[
                  const SizedBox(height: 14),
                  _MessageBox(message: _successMessage!, isError: false),
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
                      : Text(_isRegisterMode ? 'Daftar Akun Tamu' : 'Masuk'),
                ),
                const SizedBox(height: 14),
                Text(
                  _isRegisterMode
                      ? 'Akun yang dibuat digunakan untuk memesan dan memantau status reservasi.'
                      : 'Masuk diperlukan sebelum melihat katalog dan membuat reservasi.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppColors.grayMuted,
                    fontSize: 12,
                    height: 1.45,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _WelcomePanel extends StatelessWidget {
  const _WelcomePanel({required this.isRegisterMode});

  final bool isRegisterMode;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.navy,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        boxShadow: [
          BoxShadow(
            color: AppColors.navy.withValues(alpha: 0.16),
            blurRadius: 18,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isRegisterMode ? 'Daftar Akun Tamu' : 'Selamat Datang',
                  style: const TextStyle(
                    color: AppColors.card,
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  isRegisterMode
                      ? 'Buat akun untuk mulai memesan unit Wisma Binangkit.'
                      : 'Masuk untuk melihat katalog dan mengatur pesanan Anda.',
                  style: TextStyle(
                    color: AppColors.card.withValues(alpha: 0.82),
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: AppColors.card.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: Icon(
              isRegisterMode
                  ? Icons.person_add_alt_1_outlined
                  : Icons.lock_open_outlined,
              color: AppColors.card,
            ),
          ),
        ],
      ),
    );
  }
}

class _AuthModeSwitch extends StatelessWidget {
  const _AuthModeSwitch({
    required this.isRegisterMode,
    required this.isDisabled,
    required this.onChanged,
  });

  final bool isRegisterMode;
  final bool isDisabled;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.grayBorder),
      ),
      child: Row(
        children: [
          Expanded(
            child: _SwitchButton(
              label: 'Masuk',
              isActive: !isRegisterMode,
              onPressed: isDisabled ? null : () => onChanged(false),
            ),
          ),
          Expanded(
            child: _SwitchButton(
              label: 'Daftar',
              isActive: isRegisterMode,
              onPressed: isDisabled ? null : () => onChanged(true),
            ),
          ),
        ],
      ),
    );
  }
}

class _SwitchButton extends StatelessWidget {
  const _SwitchButton({
    required this.label,
    required this.isActive,
    required this.onPressed,
  });

  final String label;
  final bool isActive;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: onPressed,
      style: TextButton.styleFrom(
        foregroundColor: isActive ? AppColors.card : AppColors.grayMuted,
        backgroundColor: isActive ? AppColors.navy : Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        padding: const EdgeInsets.symmetric(vertical: 12),
      ),
      child: Text(label, style: const TextStyle(fontWeight: FontWeight.w800)),
    );
  }
}

class _AuthFormCard extends StatelessWidget {
  const _AuthFormCard({
    required this.isRegisterMode,
    required this.isLoading,
    required this.showPassword,
    required this.namaController,
    required this.emailController,
    required this.passwordController,
    required this.teleponController,
    required this.onTogglePassword,
    required this.onSubmit,
    required this.onForgotPassword,
    required this.requiredValidator,
    required this.emailValidator,
    required this.passwordValidator,
  });

  final bool isRegisterMode;
  final bool isLoading;
  final bool showPassword;
  final TextEditingController namaController;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final TextEditingController teleponController;
  final VoidCallback onTogglePassword;
  final VoidCallback onSubmit;
  final VoidCallback onForgotPassword;
  final String? Function(String? value, String label) requiredValidator;
  final String? Function(String? value) emailValidator;
  final String? Function(String? value) passwordValidator;

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        side: const BorderSide(color: AppColors.grayBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (isRegisterMode) ...[
              TextFormField(
                controller: namaController,
                enabled: !isLoading,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  labelText: 'Nama Lengkap',
                  prefixIcon: Icon(Icons.person_outline),
                ),
                validator: (value) {
                  final required = requiredValidator(value, 'Nama lengkap');
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
              controller: emailController,
              enabled: !isLoading,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              decoration: const InputDecoration(
                labelText: 'Email',
                prefixIcon: Icon(Icons.email_outlined),
              ),
              validator: emailValidator,
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: passwordController,
              enabled: !isLoading,
              obscureText: !showPassword,
              textInputAction: isRegisterMode
                  ? TextInputAction.next
                  : TextInputAction.done,
              decoration: InputDecoration(
                labelText: 'Kata Sandi',
                prefixIcon: const Icon(Icons.lock_outline),
                suffixIcon: IconButton(
                  onPressed: onTogglePassword,
                  icon: Icon(
                    showPassword
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                  ),
                ),
              ),
              validator: passwordValidator,
              onFieldSubmitted: (_) {
                if (!isRegisterMode) onSubmit();
              },
            ),
            if (isRegisterMode) ...[
              const SizedBox(height: 14),
              TextFormField(
                controller: teleponController,
                enabled: !isLoading,
                keyboardType: TextInputType.phone,
                textInputAction: TextInputAction.done,
                decoration: const InputDecoration(
                  labelText: 'Nomor Telepon',
                  prefixIcon: Icon(Icons.phone_outlined),
                ),
                validator: (value) {
                  final required = requiredValidator(value, 'Nomor telepon');
                  if (required != null) return required;
                  if (value!.trim().length > 15) {
                    return 'Nomor telepon maksimal 15 karakter';
                  }
                  return null;
                },
                onFieldSubmitted: (_) => onSubmit(),
              ),
            ] else ...[
              const SizedBox(height: 6),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: isLoading ? null : onForgotPassword,
                  child: const Text('Lupa Kata Sandi?'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _MessageBox extends StatelessWidget {
  const _MessageBox({required this.message, required this.isError});

  final String message;
  final bool isError;

  @override
  Widget build(BuildContext context) {
    final color = isError ? AppColors.merah : AppColors.hijau;

    return Container(
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            isError ? Icons.error_outline : Icons.check_circle_outline,
            color: color,
            size: 20,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(message, style: TextStyle(color: color)),
          ),
        ],
      ),
    );
  }
}
