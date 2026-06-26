import 'package:latlong2/latlong.dart';

enum IssueStatus { ingested, verified, resolved }

class Issue {
  final String id;
  final String title;
  final String description;
  final String category;
  final int severity;
  final IssueStatus status;
  final LatLng location;
  final String reporterId;
  final String reporterName;
  final double riskWeight;
  final double areaImportance;
  final String imageBeforeUrl;
  final String? imageAfterUrl;
  final int verifications;
  final int supportCount;
  final DateTime createdAt;

  const Issue({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.severity,
    required this.status,
    required this.location,
    required this.reporterId,
    required this.reporterName,
    required this.riskWeight,
    required this.areaImportance,
    required this.imageBeforeUrl,
    this.imageAfterUrl,
    required this.verifications,
    required this.supportCount,
    required this.createdAt,
  });

  // Dynamic Impact Score logic
  double get impactScore {
    final double verifValue = (verifications > 10 ? 10 : verifications) * 0.3;
    final double supportValue = (supportCount > 20 ? 20 : supportCount) * 0.15;
    final double base = severity + verifValue + supportValue + riskWeight + areaImportance;
    return base > 10.0 ? 10.0 : double.parse(base.toStringAsFixed(1));
  }

  // Dynamic Momentum Score logic
  double get momentumScore {
    if (status == IssueStatus.resolved) return 0.0;
    final double growth = verifications * 1.2 + supportCount * 0.4;
    final double urgency = severity / 10.0;
    final double momentum = growth * (1.0 + urgency);
    return momentum > 10.0 ? 10.0 : double.parse(momentum.toStringAsFixed(1));
  }

  // Dynamic Trust score logic
  double get trustScore {
    final double baseTrust = 6.5 + (verifications * 0.5);
    return baseTrust > 10.0 ? 10.0 : double.parse(baseTrust.toStringAsFixed(1));
  }

  Issue copyWith({
    String? title,
    String? description,
    IssueStatus? status,
    int? verifications,
    int? supportCount,
    String? imageAfterUrl,
  }) {
    return Issue(
      id: id,
      title: title ?? this.title,
      description: description ?? this.description,
      category: category,
      severity: severity,
      status: status ?? this.status,
      location: location,
      reporterId: reporterId,
      reporterName: reporterName,
      riskWeight: riskWeight,
      areaImportance: areaImportance,
      imageBeforeUrl: imageBeforeUrl,
      imageAfterUrl: imageAfterUrl ?? this.imageAfterUrl,
      verifications: verifications ?? this.verifications,
      supportCount: supportCount ?? this.supportCount,
      createdAt: createdAt,
    );
  }
}
