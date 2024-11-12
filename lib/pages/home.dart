import 'package:flutter/material.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color.fromRGBO(38, 38, 38, 1),
      appBar: AppBar(
        title: const Text('Unbind', style: TextStyle(color: Colors.white, fontSize: 20)),
        centerTitle: true,
        backgroundColor: const Color.fromARGB(255, 0, 0, 0),
      )
    );
  }
}