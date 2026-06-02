import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:tamu_mobile/app.dart';
import 'package:tamu_mobile/features/katalog/data/unit_repository.dart';

void main() {
  testWidgets('App renders without crashing', (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [unitListProvider.overrideWith((ref) async => const [])],
        child: const WismaBinangkitApp(),
      ),
    );

    // Splash boleh muncul beberapa frame; biarkan settle dulu.
    await tester.pump();

    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
