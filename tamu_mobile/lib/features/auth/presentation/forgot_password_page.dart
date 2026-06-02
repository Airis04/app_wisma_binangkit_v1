import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../config/theme.dart';
import '../../../shared/api/api_exception.dart';
import '../data/auth_repository.dart';

class ForgotPasswordPage extends ConsumerStatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  ConsumerState<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends ConsumerState<ForgotPasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _teleponController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _showPassword = false;
  bool _isLoading = false;
  String? _errorMessage;
  String? _successMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _teleponController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final message = await ref
          .read(authRepositoryProvider)
          .resetPassword(
            email: _emailController.text,
            noTelepon: _teleponController.text,
            passwordBaru: _passwordController.text,
          );

      if (!mounted) return;
      setState(() {
        _successMessage = message;
      });
    } catch (err) {
      if (!mounted) return;
      setState(() {
        _errorMessage = err is ApiException
            ? err.message
            : 'Gagal memperbarui kata sandi. Silakan coba lagi.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
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
    final required = _required(value, 'Kata sandi baru');
    if (required != null) return required;

    if (value!.length < 8) return 'Kata sandi baru minimal 8 karakter';
    return null;
  }

  String? _confirmPasswordValidator(String? value) {
    final required = _required(value, 'Konfirmasi kata sandi');
    if (required != null) return required;

    if (value != _passwordController.text) {
      return 'Konfirmasi kata sandi tidak sama';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lupa Password')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(
                  Icons.lock_reset_outlined,
                  size: 64,
                  color: AppColors.navy,
                ),
                const SizedBox(height: 16),
                const Text(
                  'Atur Ulang Kata Sandi',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColors.navy,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Masukkan email dan nomor telepon yang terdaftar untuk mengganti kata sandi.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.grayMuted),
                ),
                const SizedBox(height: 28),
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
                        TextFormField(
                          controller: _emailController,
                          enabled: !_isLoading,
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
                          controller: _teleponController,
                          enabled: !_isLoading,
                          keyboardType: TextInputType.phone,
                          textInputAction: TextInputAction.next,
                          decoration: const InputDecoration(
                            labelText: 'Nomor Telepon',
                            prefixIcon: Icon(Icons.phone_outlined),
                          ),
                          validator: (value) {
                            final required = _required(value, 'Nomor telepon');
                            if (required != null) return required;
                            if (value!.trim().length > 15) {
                              return 'Nomor telepon maksimal 15 karakter';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 14),
                        TextFormField(
                          controller: _passwordController,
                          enabled: !_isLoading,
                          obscureText: !_showPassword,
                          textInputAction: TextInputAction.next,
                          decoration: InputDecoration(
                            labelText: 'Kata Sandi Baru',
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
                        ),
                        const SizedBox(height: 14),
                        TextFormField(
                          controller: _confirmPasswordController,
                          enabled: !_isLoading,
                          obscureText: !_showPassword,
                          textInputAction: TextInputAction.done,
                          decoration: const InputDecoration(
                            labelText: 'Konfirmasi Kata Sandi',
                            prefixIcon: Icon(Icons.lock_outline),
                          ),
                          validator: _confirmPasswordValidator,
                          onFieldSubmitted: (_) => _submit(),
                        ),
                        if (_errorMessage != null) ...[
                          const SizedBox(height: 14),
                          _MessageBox(message: _errorMessage!, isError: true),
                        ],
                        if (_successMessage != null) ...[
                          const SizedBox(height: 14),
                          _MessageBox(
                            message: _successMessage!,
                            isError: false,
                          ),
                        ],
                        const SizedBox(height: 18),
                        ElevatedButton(
                          onPressed: _isLoading ? null : _submit,
                          child: _isLoading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: AppColors.card,
                                  ),
                                )
                              : const Text('Simpan Kata Sandi Baru'),
                        ),
                        const SizedBox(height: 10),
                        OutlinedButton(
                          onPressed: _isLoading
                              ? null
                              : () => context.go('/login'),
                          child: const Text('Kembali ke Login'),
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
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color),
      ),
      child: Text(message, style: TextStyle(color: color)),
    );
  }
}
