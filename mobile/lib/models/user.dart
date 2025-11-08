import 'dart:convert';
import 'dart:typed_data';

class User {
  const User({
    required this.id,
    required this.name,
    required this.email,
    this.role,
    this.qrCode,
    this.profilePhoto,
    this.programme,
    this.department,
    this.entryNumber,
    this.phone,
    this.hostel,
    this.emergencyDetails,
    this.metadata,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    final metadata = json;
    final Map<String, dynamic>? phoneData = _extractMap(json, 'phone');
    final Map<String, dynamic>? hostelData = _extractMap(json, 'hostel');
    final Map<String, dynamic>? emergencyData = _extractMap(json, 'emergencyDetails');
    final Map<String, dynamic>? profilePhotoData = _extractMap(json, 'profilePhoto');

    return User(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: (json['name'] ?? json['fullName'] ?? '').toString(),
      email: (json['email'] ?? json['username'] ?? '').toString(),
      role: json['role']?.toString(),
      qrCode: json['qrCode']?.toString(),
      profilePhoto: profilePhotoData != null ? ProfilePhoto.fromMap(profilePhotoData) : null,
      programme: _extractString(json, 'programme'),
      department: _extractString(json, 'department'),
      entryNumber: _extractString(json, 'entryNumber'),
      phone: phoneData != null ? PhoneInfo.fromMap(phoneData) : null,
      hostel: hostelData != null ? HostelInfo.fromMap(hostelData) : null,
      emergencyDetails: emergencyData != null ? EmergencyDetails.fromMap(emergencyData) : null,
      metadata: metadata,
    );
  }

  final String id;
  final String name;
  final String email;
  final String? role;
  final String? qrCode;
  final ProfilePhoto? profilePhoto;
  final String? programme;
  final String? department;
  final String? entryNumber;
  final PhoneInfo? phone;
  final HostelInfo? hostel;
  final EmergencyDetails? emergencyDetails;
  final Map<String, dynamic>? metadata;

  User copyWith({
    String? id,
    String? name,
    String? email,
    String? role,
    String? qrCode,
    ProfilePhoto? profilePhoto,
    String? programme,
    String? department,
    String? entryNumber,
    PhoneInfo? phone,
    HostelInfo? hostel,
    EmergencyDetails? emergencyDetails,
    Map<String, dynamic>? metadata,
  }) {
    final effectiveQrCode = qrCode ?? this.qrCode;
    final existingMetadata = metadata ?? this.metadata;

    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      role: role ?? this.role,
      qrCode: effectiveQrCode,
      profilePhoto: profilePhoto ?? this.profilePhoto,
      programme: programme ?? this.programme,
      department: department ?? this.department,
      entryNumber: entryNumber ?? this.entryNumber,
      phone: phone ?? this.phone,
      hostel: hostel ?? this.hostel,
      emergencyDetails: emergencyDetails ?? this.emergencyDetails,
      metadata: existingMetadata,
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'name': name,
      'email': email,
      if (role != null) 'role': role,
      if (qrCode != null) 'qrCode': qrCode,
      if (profilePhoto != null) 'profilePhoto': profilePhoto!.toJson(),
      if (programme != null) 'programme': programme,
      if (department != null) 'department': department,
      if (entryNumber != null) 'entryNumber': entryNumber,
      if (phone != null) 'phone': phone!.toJson(),
      if (hostel != null) 'hostel': hostel!.toJson(),
      if (emergencyDetails != null) 'emergencyDetails': emergencyDetails!.toJson(),
      if (metadata != null) 'metadata': metadata,
    };
  }

  static String? _extractString(Map<String, dynamic> json, String key) {
    final directValue = json[key];
    if (directValue is String && directValue.isNotEmpty) {
      return directValue;
    }
    final metadata = json['metadata'];
    if (metadata is Map<String, dynamic>) {
      final value = metadata[key];
      if (value is String && value.isNotEmpty) {
        return value;
      }
    }
    return null;
  }

  static Map<String, dynamic>? _extractMap(Map<String, dynamic> json, String key) {
    final directValue = json[key];
    if (directValue is Map<String, dynamic>) {
      return directValue;
    }
    final metadata = json['metadata'];
    if (metadata is Map<String, dynamic>) {
      final metaValue = metadata[key];
      if (metaValue is Map<String, dynamic>) {
        return metaValue;
      }
    }
    return null;
  }
}

class PhoneInfo {
  const PhoneInfo({required this.countryCode, required this.number});

  factory PhoneInfo.fromMap(Map<String, dynamic> map) {
    return PhoneInfo(
      countryCode: (map['countryCode'] ?? '').toString(),
      number: (map['number'] ?? '').toString(),
    );
  }

  final String countryCode;
  final String number;

  Map<String, dynamic> toJson() => {
        'countryCode': countryCode,
        'number': number,
      };
}

class HostelInfo {
  const HostelInfo({required this.name, required this.roomNo});

  factory HostelInfo.fromMap(Map<String, dynamic> map) {
    return HostelInfo(
      name: (map['name'] ?? '').toString(),
      roomNo: (map['roomNo'] ?? '').toString(),
    );
  }

  final String name;
  final String roomNo;

  Map<String, dynamic> toJson() => {
        'name': name,
        'roomNo': roomNo,
      };
}

class EmergencyDetails {
  const EmergencyDetails({
    required this.name,
    required this.address,
    required this.phone,
    this.additionalPhone,
  });

  factory EmergencyDetails.fromMap(Map<String, dynamic> map) {
    return EmergencyDetails(
      name: (map['name'] ?? '').toString(),
      address: (map['address'] ?? '').toString(),
      phone: (map['phone'] ?? '').toString(),
      additionalPhone: map['additionalPhone']?.toString(),
    );
  }

  final String name;
  final String address;
  final String phone;
  final String? additionalPhone;

  Map<String, dynamic> toJson() => {
        'name': name,
        'address': address,
        'phone': phone,
        if (additionalPhone != null) 'additionalPhone': additionalPhone,
      };
}

class ProfilePhoto {
  const ProfilePhoto({
    required this.filename,
    required this.mimetype,
    required this.size,
    required this.data,
  });

  factory ProfilePhoto.fromMap(Map<String, dynamic> map) {
    return ProfilePhoto(
      filename: (map['filename'] ?? '').toString(),
      mimetype: (map['mimetype'] ?? '').toString(),
      size: map['size'] is int ? map['size'] as int : int.tryParse(map['size']?.toString() ?? '') ?? 0,
      data: (map['data'] ?? '').toString(),
    );
  }

  final String filename;
  final String mimetype;
  final int size;
  final String data;

  Uint8List? get bytes {
    if (data.isEmpty) {
      return null;
    }
    try {
      return base64Decode(data);
    } catch (_) {
      return null;
    }
  }

  Map<String, dynamic> toJson() => {
        'filename': filename,
        'mimetype': mimetype,
        'size': size,
        'data': data,
      };
}

