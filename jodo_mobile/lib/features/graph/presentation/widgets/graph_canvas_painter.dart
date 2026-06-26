import 'dart:math';
import 'package:flutter/material.dart';

enum NodeType { citizen, issue, verifier, cluster }

class GraphNode {
  final String id;
  final String label;
  final NodeType type;
  Offset position;
  Offset velocity = Offset.zero;
  bool isDragged = false;

  GraphNode({
    required this.id,
    required this.label,
    required this.type,
    required this.position,
  });
}

class GraphEdge {
  final String from;
  final String to;
  final String label;

  GraphEdge({
    required this.from,
    required this.to,
    required this.label,
  });
}

class GraphCanvasPainter extends CustomPainter {
  final List<GraphNode> nodes;
  final List<GraphEdge> edges;
  final Offset panOffset;
  final double scale;

  GraphCanvasPainter({
    required this.nodes,
    required this.edges,
    required this.panOffset,
    required this.scale,
  });

  @override
  void paint(Canvas canvas, Size size) {
    canvas.save();
    // Apply pan and zoom scale translations
    canvas.translate(size.width / 2 + panOffset.dx, size.height / 2 + panOffset.dy);
    canvas.scale(scale);

    final Paint edgePaint = Paint()
      ..color = const Color(0x335E7A73) // 20% opacity primarySage
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    final Paint textBgPaint = Paint()
      ..color = const Color(0xFFFCFBF8)
      ..style = PaintingStyle.fill;

    // 1. Draw Edges
    for (var edge in edges) {
      final GraphNode? fromNode = _findNode(edge.from);
      final GraphNode? toNode = _findNode(edge.to);

      if (fromNode != null && toNode != null) {
        canvas.drawLine(fromNode.position, toNode.position, edgePaint);
        
        // Draw small label at the middle of the line
        final Offset middle = Offset(
          (fromNode.position.dx + toNode.position.dx) / 2,
          (fromNode.position.dy + toNode.position.dy) / 2,
        );

        final textPainter = TextPainter(
          text: TextSpan(
            text: edge.label,
            style: const TextStyle(color: Color(0xFF6E7577), fontSize: 7.0, fontFamily: 'Inter'),
          ),
          textDirection: TextDirection.ltr,
        )..layout();

        final RRect textRect = RRect.fromRectAndRadius(
          Rect.fromCenter(center: middle, width: textPainter.width + 4, height: textPainter.height + 2),
          const Radius.circular(2.0),
        );
        canvas.drawRRect(textRect, textBgPaint);
        textPainter.paint(canvas, middle - Offset(textPainter.width / 2, textPainter.height / 2));
      }
    }

    // 2. Draw Nodes
    for (var node in nodes) {
      _paintNode(canvas, node);
    }

    canvas.restore();
  }

  void _paintNode(Canvas canvas, GraphNode node) {
    final Paint nodePaint = Paint()..style = PaintingStyle.fill;
    final Paint borderPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    // Node style config based on NodeType
    switch (node.type) {
      case NodeType.issue:
        nodePaint.color = const Color(0xFFCFA56A); // Gold
        borderPaint.color = const Color(0xFF5E7A73); // Sage
        
        // Issue node is drawn as a rounded box
        final RRect box = RRect.fromRectAndRadius(
          Rect.fromCenter(center: node.position, width: 85.0, height: 35.0),
          const Radius.circular(6.0),
        );
        canvas.drawRRect(box, nodePaint);
        canvas.drawRRect(box, borderPaint);
        _drawText(canvas, node.label, node.position, Colors.white, true);
        break;

      case NodeType.cluster:
        nodePaint.color = const Color(0xFFCFA56A);
        borderPaint.color = Colors.redAccent;
        
        // Cluster node is drawn as a diamond shape
        final Path diamondPath = Path()
          ..moveTo(node.position.dx, node.position.dy - 20)
          ..lineTo(node.position.dx + 20, node.position.dy)
          ..lineTo(node.position.dx, node.position.dy + 20)
          ..lineTo(node.position.dx - 20, node.position.dy)
          ..close();
        canvas.drawPath(diamondPath, nodePaint);
        canvas.drawPath(diamondPath, borderPaint);
        _drawText(canvas, node.label, node.position + const Offset(0, 25), const Color(0xFF2D3436), false);
        break;

      case NodeType.citizen:
        nodePaint.color = const Color(0xFF5E7A73); // Sage
        borderPaint.color = const Color(0xFFFCFBF8); // Cream border
        
        // Citizen node is drawn as a circle
        canvas.drawCircle(node.position, 10.0, nodePaint);
        canvas.drawCircle(node.position, 10.0, borderPaint);
        _drawText(canvas, node.label, node.position + const Offset(0, 15), const Color(0xFF2D3436), false);
        break;

      case NodeType.verifier:
        nodePaint.color = const Color(0xFF7BA37A); // Olive Green
        borderPaint.color = const Color(0xFFFCFBF8);
        
        canvas.drawCircle(node.position, 8.0, nodePaint);
        canvas.drawCircle(node.position, 8.0, borderPaint);
        _drawText(canvas, node.label, node.position + const Offset(0, 13), const Color(0xFF2D3436), false);
        break;
    }
  }

  void _drawText(Canvas canvas, String text, Offset center, Color color, bool bold) {
    final textPainter = TextPainter(
      text: TextSpan(
        text: text,
        style: TextStyle(
          color: color, 
          fontSize: 8.0, 
          fontFamily: 'Inter',
          fontWeight: bold ? FontWeight.bold : FontWeight.normal,
        ),
      ),
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
    )..layout();

    textPainter.paint(
      canvas,
      center - Offset(textPainter.width / 2, textPainter.height / 2),
    );
  }

  GraphNode? _findNode(String id) {
    for (var node in nodes) {
      if (node.id == id) return node;
    }
    return null;
  }

  @override
  bool shouldRepaint(covariant GraphCanvasPainter oldDelegate) {
    return true; // Dynamic coordinate simulation requires continuous repaints
  }
}
