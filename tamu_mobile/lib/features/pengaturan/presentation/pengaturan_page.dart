import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../config/theme.dart';
import '../../auth/application/auth_controller.dart';

class PengaturanPage extends ConsumerStatefulWidget {
  const PengaturanPage({super.key});

  @override
  ConsumerState<PengaturanPage> createState() => _PengaturanPageState();
}

class _PengaturanPageState extends ConsumerState<PengaturanPage> {
  final _formKey = GlobalKey<FormState>();
  final _namaController = TextEditingController();
  final _teleponController = TextEditingController();
  final _passwordLamaController = TextEditingController();
  final _passwordBaruController = TextEditingController();
  final _konfirmasiPasswordController = TextEditingController();

  bool _initialized = false;
  bool _showPassword = false;
  String? _successMessage;

  @override
  void dispose() {
    _namaController.dispose();
    _teleponController.dispose();
    _passwordLamaController.dispose();
    _passwordBaruController.dispose();
    _konfirmasiPasswordController.dispose();
    super.dispose();
  }

  void _syncUserToForm(AuthState authState) {
    final user = authState.user;
    if (_initialized || user == null) return;

    _namaController.text = user.namaLengkap;
    _teleponController.text = user.noTelepon;
    _initialized = true;
  }

  Future<void> _pickPhoto() async {
    final picker = ImagePicker();
    final file = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
    );
    if (file == null) return;

    final ok = await ref
        .read(authControllerProvider.notifier)
        .updateProfilePhoto(filePath: file.path);

    if (!mounted || !ok) return;
    setState(() {
      _successMessage = 'Foto profil berhasil diperbarui.';
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final passwordLama = _passwordLamaController.text;
    final passwordBaru = _passwordBaruController.text;

    final ok = await ref
        .read(authControllerProvider.notifier)
        .updateAccount(
          namaLengkap: _namaController.text,
          noTelepon: _teleponController.text,
          passwordLama: passwordLama.isEmpty ? null : passwordLama,
          passwordBaru: passwordBaru.isEmpty ? null : passwordBaru,
        );

    if (!mounted || !ok) return;
    _passwordLamaController.clear();
    _passwordBaruController.clear();
    _konfirmasiPasswordController.clear();
    setState(() {
      _successMessage = 'Pengaturan akun berhasil disimpan.';
    });
  }

  String? _required(String? value, String label) {
    if (value == null || value.trim().isEmpty) {
      return '$label wajib diisi';
    }
    return null;
  }

  String? _passwordValidator(String? value) {
    final passwordLama = _passwordLamaController.text;
    final passwordBaru = value ?? '';

    if (passwordLama.isEmpty && passwordBaru.isEmpty) return null;
    if (passwordLama.isEmpty) return 'Kata sandi lama wajib diisi';
    if (passwordBaru.length < 8) return 'Kata sandi baru minimal 8 karakter';
    return null;
  }

  String? _confirmPasswordValidator(String? value) {
    if (_passwordBaruController.text.isEmpty) return null;
    if (value != _passwordBaruController.text) {
      return 'Konfirmasi kata sandi tidak sama';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);
    final user = authState.user;
    _syncUserToForm(authState);

    return Scaffold(
      appBar: AppBar(title: const Text('Pengaturan Akun')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 104),
          children: [
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.navy,
                borderRadius: BorderRadius.circular(AppRadius.lg),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.navy.withValues(alpha: 0.18),
                    blurRadius: 18,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                children: [
                  _ProfilePhoto(
                    name: user?.namaLengkap ?? 'Tamu',
                    photoUrl: user?.fotoProfilUrl,
                    isLoading: authState.isLoading,
                    onPickPhoto: _pickPhoto,
                  ),
                  const SizedBox(height: 14),
                  Text(
                    user?.namaLengkap ?? 'Tamu',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: AppColors.card,
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user?.email ?? '-',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppColors.card.withValues(alpha: 0.78),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _ProfilePill(
                        icon: Icons.verified_user_outlined,
                        label: user?.role ?? 'tamu',
                      ),
                      _ProfilePill(
                        icon: Icons.phone_outlined,
                        label: user?.noTelepon ?? '-',
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            _SectionCard(
              title: 'Profil',
              subtitle: 'Nama dan nomor telepon yang dipakai untuk reservasi.',
              icon: Icons.person_outline,
              children: [
                TextFormField(
                  controller: _namaController,
                  enabled: !authState.isLoading,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    labelText: 'Nama Lengkap',
                    prefixIcon: Icon(Icons.person_outline),
                  ),
                  validator: (value) {
                    final required = _required(value, 'Nama lengkap');
                    if (required != null) return required;
                    if (value!.trim().length > 30) {
                      return 'Nama lengkap maksimal 30 karakter';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _teleponController,
                  enabled: !authState.isLoading,
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
              ],
            ),
            const SizedBox(height: 14),
            _SectionCard(
              title: 'Informasi Akun',
              subtitle: 'Data ini digunakan untuk identitas akun tamu.',
              icon: Icons.badge_outlined,
              children: [
                _InfoTile(
                  icon: Icons.email_outlined,
                  label: 'Email',
                  value: user?.email ?? '-',
                ),
                _InfoTile(
                  icon: Icons.verified_user_outlined,
                  label: 'Role',
                  value: user?.role ?? '-',
                ),
              ],
            ),
            const SizedBox(height: 14),
            _SectionCard(
              title: 'Ganti Kata Sandi',
              subtitle: 'Isi bagian ini hanya jika ingin mengganti kata sandi.',
              icon: Icons.lock_outline,
              children: [
                TextFormField(
                  controller: _passwordLamaController,
                  enabled: !authState.isLoading,
                  obscureText: !_showPassword,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    labelText: 'Kata Sandi Lama',
                    prefixIcon: Icon(Icons.lock_outline),
                  ),
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _passwordBaruController,
                  enabled: !authState.isLoading,
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
                  controller: _konfirmasiPasswordController,
                  enabled: !authState.isLoading,
                  obscureText: !_showPassword,
                  textInputAction: TextInputAction.done,
                  decoration: const InputDecoration(
                    labelText: 'Konfirmasi Kata Sandi Baru',
                    prefixIcon: Icon(Icons.lock_outline),
                  ),
                  validator: _confirmPasswordValidator,
                ),
              ],
            ),
            const SizedBox(height: 14),
            _SectionCard(
              title: 'Aplikasi',
              subtitle: 'Informasi singkat tentang cara pemesanan di aplikasi.',
              icon: Icons.apps_outlined,
              children: const [
                _InfoTile(
                  icon: Icons.home_work_outlined,
                  label: 'Aplikasi',
                  value: 'Wisma Binangkit Mobile',
                ),
                _InfoTile(
                  icon: Icons.payment_outlined,
                  label: 'Pembayaran',
                  value: 'Transfer manual dan verifikasi pemilik',
                ),
              ],
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
                  : const Text('Simpan Pengaturan Akun'),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: AppColors.grayBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'Sesi Akun',
                    style: TextStyle(
                      color: AppColors.grayText,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Keluar jika ingin mengganti akun pada perangkat ini.',
                    style: TextStyle(color: AppColors.grayMuted, height: 1.35),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: authState.isLoading
                        ? null
                        : () async {
                            await ref
                                .read(authControllerProvider.notifier)
                                .logout();
                            if (context.mounted) context.go('/login');
                          },
                    icon: const Icon(Icons.logout_outlined),
                    label: const Text('Keluar dari Akun'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.merah,
                      side: const BorderSide(color: AppColors.merah),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfilePill extends StatelessWidget {
  const _ProfilePill({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: AppColors.card.withValues(alpha: 0.13),
        borderRadius: BorderRadius.circular(AppRadius.sm),
        border: Border.all(color: AppColors.card.withValues(alpha: 0.16)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 15, color: AppColors.card),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              color: AppColors.card,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfilePhoto extends StatelessWidget {
  const _ProfilePhoto({
    required this.name,
    required this.photoUrl,
    required this.isLoading,
    required this.onPickPhoto,
  });

  final String name;
  final String? photoUrl;
  final bool isLoading;
  final VoidCallback onPickPhoto;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: AppColors.card.withValues(alpha: 0.18),
            shape: BoxShape.circle,
          ),
          child: SizedBox(
            width: 104,
            height: 104,
            child: ClipOval(
              child: photoUrl == null
                  ? ColoredBox(
                      color: AppColors.navy.withValues(alpha: 0.12),
                      child: Center(
                        child: Text(
                          name.isEmpty ? 'T' : name[0].toUpperCase(),
                          style: const TextStyle(
                            color: AppColors.navy,
                            fontSize: 36,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    )
                  : CachedNetworkImage(
                      imageUrl: photoUrl!,
                      fit: BoxFit.cover,
                      placeholder: (context, url) =>
                          const Center(child: CircularProgressIndicator()),
                      errorWidget: (context, url, error) => const Icon(
                        Icons.account_circle_outlined,
                        color: AppColors.grayMuted,
                        size: 72,
                      ),
                    ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: isLoading ? null : onPickPhoto,
          icon: const Icon(Icons.photo_camera_outlined),
          label: const Text('Ganti Foto Profil'),
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.card,
            side: BorderSide(color: AppColors.card.withValues(alpha: 0.7)),
          ),
        ),
      ],
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.children,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        side: const BorderSide(color: AppColors.grayBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: AppColors.navy.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: Icon(icon, color: AppColors.navy, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          color: AppColors.grayText,
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: const TextStyle(
                          color: AppColors.grayMuted,
                          height: 1.35,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            ...children,
          ],
        ),
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 20, color: AppColors.navy),
            const SizedBox(width: 10),
            SizedBox(
              width: 92,
              child: Text(
                label,
                style: const TextStyle(color: AppColors.grayMuted),
              ),
            ),
            Expanded(
              child: Text(
                value,
                style: const TextStyle(
                  color: AppColors.grayText,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
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
      padding: const EdgeInsets.all(12),
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
