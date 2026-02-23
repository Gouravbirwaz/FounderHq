import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/api_client.dart';

class ProfileView extends ConsumerStatefulWidget {
  const ProfileView({Key? key}) : super(key: key);

  @override
  ConsumerState<ProfileView> createState() => _ProfileViewState();
}

class _ProfileViewState extends ConsumerState<ProfileView> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  
  File? _localImage;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _populateFields();
  }

  void _populateFields() {
    final user = ref.read(authProvider).user;
    if (user != null) {
      _nameController.text = user['name'] ?? '';
      _emailController.text = user['email'] ?? '';
      _phoneController.text = user['phone_number'] ?? '';
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _localImage = File(pickedFile.path);
      });
      // Optionally could auto-upload here, but we'll do it on "Edit Profile" tap
    }
  }

  Future<void> _saveProfile() async {
    setState(() => _isSaving = true);
    
    final authNotif = ref.read(authProvider.notifier);
    
    // Upload image if selected
    if (_localImage != null) {
      final successImg = await authNotif.uploadAvatar(_localImage!.path);
      if (!successImg && mounted) {
         ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to upload image')));
      }
    }
    
    // Update text fields
    final successProfile = await authNotif.updateProfile(
      _nameController.text.trim(),
      _emailController.text.trim(),
      _phoneController.text.trim(),
    );

    setState(() => _isSaving = false);

    if (mounted) {
      if (successProfile) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile Updated Successfully', style: TextStyle(color: Colors.black)), backgroundColor: Color(0xFFFFD700)));
      } else {
        final error = ref.read(authProvider).error;
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error ?? 'Failed to update user')));
      }
    }
  }

  ImageProvider _getAvatarImage(Map<String, dynamic>? user) {
    // 1. Edge caching: Show local picked file immediately
    if (_localImage != null) {
      return FileImage(_localImage!);
    }
    // 2. Network image from backend
    if (user != null && user['avatar_url'] != null) {
      final url = user['avatar_url'].toString();
      final fullUrl = url.startsWith('http') ? url : '${const String.fromEnvironment('API_URL', defaultValue: 'https://unengaged-slatier-anibal.ngrok-free.dev')}$url';
      return NetworkImage(fullUrl);
    }
    // 3. Fallback placeholder
    return const NetworkImage('https://i.imgur.com/8QWv1xN.png'); 
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    const Color brandYellow = Color(0xFFFFD700);

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E1E), // Flat dark mode
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Edit Profile', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Avatar with Camera Badge
            Center(
              child: GestureDetector(
                onTap: _pickImage,
                child: Stack(
                  children: [
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white.withOpacity(0.1), width: 2),
                        image: DecorationImage(
                          image: _getAvatarImage(user),
                          fit: BoxFit.cover,
                        ),
                      ),
                      child: (user?['avatar_url'] == null && _localImage == null) 
                        ? const Icon(Icons.person, size: 60, color: Colors.transparent) // Hidden by placeholder
                        : null,
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: const BoxDecoration(
                          color: brandYellow,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.camera_alt, color: Colors.black, size: 18),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 48),

            // Form Fields
            _CustomTextField(
              label: 'Full Name',
              icon: Icons.person_outline,
              controller: _nameController,
              brandColor: brandYellow,
            ),
            const SizedBox(height: 24),

            _CustomTextField(
              label: 'E-Mail',
              icon: Icons.email_outlined,
              controller: _emailController,
              brandColor: brandYellow,
            ),
            const SizedBox(height: 24),

            _CustomTextField(
              label: 'Phone No',
              icon: Icons.phone_outlined,
              controller: _phoneController,
              brandColor: brandYellow,
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 40),

            // Edit Profile Yellow Button
            ElevatedButton(
              onPressed: _isSaving ? null : _saveProfile,
              style: ElevatedButton.styleFrom(
                backgroundColor: brandYellow,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 18),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                ),
                elevation: 0,
              ),
              child: _isSaving 
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2))
                : const Text('Edit Profile', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 32),

            // Footer Details
            Center(
              child: ElevatedButton(
                onPressed: () async {
                  await ref.read(authProvider.notifier).logout();
                  if (context.mounted) {
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.redAccent.withOpacity(0.15),
                  foregroundColor: Colors.redAccent,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 12),
                ),
                child: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CustomTextField extends StatelessWidget {
  final String label;
  final IconData icon;
  final TextEditingController controller;
  final Color brandColor;
  final TextInputType keyboardType;

  const _CustomTextField({
    required this.label,
    required this.icon,
    required this.controller,
    required this.brandColor,
    this.keyboardType = TextInputType.text,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      style: const TextStyle(color: Colors.white, fontSize: 16),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: brandColor, fontSize: 14),
        floatingLabelBehavior: FloatingLabelBehavior.always,
        prefixIcon: Icon(icon, color: brandColor),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(30),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.2), width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(30),
          borderSide: BorderSide(color: brandColor, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
      ),
    );
  }
}
