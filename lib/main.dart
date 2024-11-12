import 'package:flutter/material.dart';
import 'package:unbind_app/pages/home.dart';
import 'package:unbind_app/pages/login.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Unbind Demo',
      home: const HomePage(),
      debugShowCheckedModeBanner: false,
      theme: ThemeData(fontFamily: 'Joan', primaryColorDark: const Color.fromARGB(255, 32, 32, 32))
    );
  }
}