/* eslint-disable */
import {View, Text, SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import React, {useState, useEffect} from 'react';
import MapView, {Marker, Polyline} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import haversine from 'haversine';
import MapViewDirections from 'react-native-maps-directions';
import {useIsFocused, useNavigation} from '@react-navigation/native';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  instructions: {
    fontSize: 20,
    margin: 10,
  },
});

const GOOGLE_MAPS_API_KEY = 'AIzaSyA8UHc-D4VOdkBY1Hi-SgWScoMrijBAgYg';

const deliveries = [
  {
    latitude: 28.5355,
    longitude: 77.391,
    amount: 500,
    location: 'Noida, UP',
    delivery: true,
    timestamp: '2021-07-20T12:59:00.000Z',
  },
  {
    latitude: 26.1542,
    longitude: 85.8918,
    amount: 800,
    location: 'Darbhanga, Bihar',
    delivery: true,
    timestamp: '2021-09-27T12:47:00.000Z',
  },
  {
    latitude: 26.7606,
    longitude: 83.3732,
    amount: 700,
    location: 'Gorakhpur, UP',
    delivery: true,
    timestamp: '2022-06-23T12:40:00.000Z',
  },
  {
    latitude: 25.4723,
    longitude: 85.7082,
    amount: 580,
    location: 'Barh, Bihar',
    delivery: true,
    timestamp: '2021-06-20T12:40:00.000Z',
  },
  {
    latitude: 19.076,
    longitude: 72.8777,
    amount: 590,
    location: 'Mumbai, Maharastra',
    delivery: true,
    timestamp: '2021-05-20T12:00:00.000Z',
  },
  {
    latitude: 22.5726,
    longitude: 88.3639,
    amount: 500,
    location: 'Kolkata, West Bengal',
    delivery: true,
    timestamp: '2021-05-22T13:10:00.000Z',
  },
];

const pickups = [
  {
    latitude: 25.56254,
    longitude: 84.84521,
    amount: 500,
    location: 'Patna pickup address',
    delivery: false,
    timestamp: '2021-07-20T12:59:00.000Z',
  },
  {
    latitude: 25.51247,
    longitude: 84.8621,
    amount: 500,
    location: 'Patna pickup address',
    delivery: false,
    timestamp: '2021-07-20T12:59:00.000Z',
  },
  {
    latitude: 25.52354,
    longitude: 84.87415,
    amount: 500,
    location: 'Patna pickup address',
    delivery: false,
    timestamp: '2021-07-20T12:59:00.000Z',
  },
];

const mapStyle = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#242f3e',
      },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#746855',
      },
    ],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#242f3e',
      },
    ],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [
      {
        color: '#263c3f',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#6b9a76',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: '#38414e',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#212a37',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9ca5b3',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      {
        color: '#746855',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#1f2835',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#f3d19c',
      },
    ],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [
      {
        color: '#2f3948',
      },
    ],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#17263c',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#515c6d',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#17263c',
      },
    ],
  },
];
const host = '192.168.137.207:5000';
export const Maps = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [nearest, setNearest] = useState(null);
  const [delivery, setDelivery] = useState(pickups);
  const [deliveryPackages, setDeliveryPackages] = useState([
    {
      id: '85',
      AWB: '123!@#',
      EDD: '2021-05-22T13:10:00.000Z',
      deliveryTimestamp: '',
      customer: {
        address: 'Noida, UP',
        name: 'Aditya Kumar',
        latitude: 25.5344545,
        longitude: 84.8550015,
      },
      delivery: true,
    },
    {
      id: '13',
      AWB: '123r@#',
      EDD: '2021-05-23T13:50:00.000Z',
      deliveryTimestamp: '',
      customer: {
        address: 'Barh, Bihar',
        name: 'Anurag Deo',
        latitude: 25.5344542,
        longitude: 84.8550014,
      },
      delivery: true,
    },
  ]);
  const [pickupPackages, setPickupPackages] = useState([
    {
      id: '84',
      AWB: '123!@#',
      EDP: '2021-05-22T13:10:00.000Z',
      pickupTimestamp: '',
      customer: {
        address: 'Noida, UP',
        name: 'Aditya Kumar',
        latitude: 25.5344545,
        longitude: 84.8550015,
      },
      delivery: false,
    },
    {
      id: '23',
      AWB: '123r@#',
      EDP: '2021-05-23T13:50:00.000Z',
      pickupTimestamp: '',
      customer: {
        address: 'Barh, Bihar',
        name: 'Anurag Deo',
        latitude: 25.5344542,
        longitude: 84.8550014,
      },
      delivery: false,
    },
  ]);
  const [points, setPoints] = useState([...deliveryPackages]);
  useEffect(() => {
    const fetchDeliveryDetails = async () => {
      const response = await fetch(`http://${host}/package/route-packages`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log(data);
    };
    if (isFocused) {
      fetchDeliveryDetails();
    }
  }, [isFocused]);
  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => console.log(error),
      {enableHighAccuracy: false, timeout: 30000, maximumAge: 3600000},
    );
  }, []);

  useEffect(() => {
    // if (!currentLocation) return;
    console.log(currentLocation);
    let nearestPoint = {
      latitude: points[0].customer.latitude,
      longitude: points[0].customer.longitude,
    };
    points.forEach(point => {
      log(point);
      const deliverPos = {
        latitude: point.customer.latitude,
        longitude: point.customer.longitude,
      };
      if (
        haversine(currentLocation, deliverPos) <
        haversine(currentLocation, nearestPoint)
      ) {
        nearestPoint = deliverPos;
      }
    });
    setNearest(nearestPoint);
  }, [currentLocation, deliveries, pickups, points]);

  const handleRouteReady = route => {
    setRoute(route);
  };

  const handleOnPress = point => {
    // remove delivery point after delivery
    // setDelivery(delivery.filter((delivery) => delivery !== point));
    console.log(point);
    const destination = {
      latitude: point.customer.latitude,
      longitude: point.customer.longitude,
    };
    setPoints(points.filter(delivery => delivery !== point));
    navigation.navigate('VerifyDelivery', {
      currentLocation: currentLocation,
      destination: destination,
      delivery: point.delivery,
      location: point.customer.address,
    });
  };
  return (
    <View style={styles.container}>
      {currentLocation && nearest ? (
        <MapView
          style={styles.map}
          customMapStyle={mapStyle}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
          {/* {deliveries.map((delivery) =>{console.log(delivery);)})} */}

          {points.map(delivery => (
            <Marker
              key={`delivery-${delivery.customer.latitude}-${delivery.customer.longitude}`}
              coordinate={{
                latitude: delivery.customer.latitude,
                longitude: delivery.customer.longitude,
              }}
              pinColor={delivery.delivery ? 'red' : 'teal'}
              onPress={() => handleOnPress(delivery)}
            />
          ))}
          {/* {delivery.map(pickup => (
            <Marker
              key={`pickup-${pickup.latitude}-${pickup.longitude}`}
              coordinate={pickup}
              pinColor={'green'}
              onPress={() => handleOnPress(pickup)}
            />
          ))} */}
          {/* <Polyline
            coordinates={route ? route.coordinates : []}
            strokeWidth={4}
            strokeColor="#000"
          /> */}
          {/* {console.log(currentLocation)} */}
          <Marker coordinate={currentLocation} pinColor="yellow" />
          {/* <Marker coordinate={nearest} /> */}
          <MapViewDirections
            origin={currentLocation}
            destination={nearest}
            optimizeWaypoints={true}
            apikey={GOOGLE_MAPS_API_KEY}
            mode="DRIVING"
            strokeWidth={4}
            strokeColor="#39FF14"
            onReady={handleRouteReady}
            onError={error => console.log(error)}
          />
        </MapView>
      ) : null}
    </View>
  );
};
