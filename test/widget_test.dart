import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pbcc/config/constants.dart';

void main() {
  test('Constants check', () {
    expect(ChurchInfo.shortName, 'PBCC');
    expect(BrandColors.primary, const Color(0xFF6B334B));
  });

  testWidgets('Simple UI test', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: Scaffold(
        body: Text('Powell Butte Church'),
      ),
    ));

    expect(find.text('Powell Butte Church'), findsOneWidget);
  });
}
