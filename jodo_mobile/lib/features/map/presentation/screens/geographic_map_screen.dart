import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class GeographicMapScreen extends ConsumerStatefulWidget {
  const GeographicMapScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<GeographicMapScreen> createState() => _GeographicMapScreenState();
}

class _GeographicMapScreenState extends ConsumerState<GeographicMapScreen> {
  GoogleMapController? _mapController;
  
  static const CameraPosition _initialPosition = CameraPosition(
    target: LatLng(12.9716, 77.5946), // Sector 4 center coordinates
    zoom: 14.5,
  );

  @override
  Widget build(BuildContext context) {
    // Generate Google Maps Markers from observation states
    final Set<Marker> markers = {
      Marker(
        markerId: const MarkerId('issue-1'),
        position: const LatLng(12.9716, 77.5946),
        infoWindow: const InfoWindow(
          title: "Clogged Storm Drain #1",
          snippet: "Impact Score: 7.2 | Active",
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
      ),
      Marker(
        markerId: const MarkerId('issue-2'),
        position: const LatLng(12.9760, 77.5980),
        infoWindow: const InfoWindow(
          title: "Collapsed Pathway Block #2",
          snippet: "Impact Score: 5.6 | Active",
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
      ),
      Marker(
        markerId: const MarkerId('issue-3'),
        position: const LatLng(12.9680, 77.5900),
        infoWindow: const InfoWindow(
          title: "Trash Dump Site #3",
          snippet: "Status: Resolved | Olive green indicator",
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
      )
    };

    return Scaffold(
      body: Stack(
        children: [
          // Native Google Map widget
          GoogleMap(
            initialCameraPosition: _initialPosition,
            markers: markers,
            onMapCreated: (controller) {
              _mapController = controller;
            },
            zoomControlsEnabled: false,
            myLocationButtonEnabled: true,
            myLocationEnabled: true,
            compassEnabled: true,
            mapToolbarEnabled: false,
          ),
          
          // Google search and layer overlay widgets
          Positioned(
            top: 40,
            left: 16,
            right: 16,
            child: Card(
              color: Colors.white,
              elevation: 4,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                child: Row(
                  children: [
                    const Icon(Icons.search, color: Color(0xFF5E7A73)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        decoration: InputDecoration(
                          hintText: "Search Jodo risk spots...",
                          border: InputBorder.none,
                          hintStyle: TextStyle(color: Colors.grey[400], fontSize: 13),
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.tune, color: Color(0xFF5E7A73), size: 20),
                      onPressed: () {},
                    ),
                  ],
                ),
              ),
            ),
          )
        ],
      ),
    );
  }
}
