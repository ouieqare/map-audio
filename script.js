var map;
  var markers = [];
  var startMarker;
  var openInfoWindow = null;


  function geocodeStartAddress() {
    var startAddress = document.getElementById('start').value;
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: startAddress }, function (results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        // Supprimer le marqueur précédent, s'il existe
        if (startMarker) {
          startMarker.setMap(null);
        }

        var location = results[0].geometry.location;

        // Ajouter un nouveau marqueur avec un picot vert
        startMarker = new google.maps.Marker({
          map: map,
          position: location,
          icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
        });

        // Déplace la carte pour qu'elle soit centrée sur le nouveau marqueur
        map.setCenter(location);
      } else {
        console.log('Erreur de géocodage pour l\'adresse de départ : ' + status);
      }
    });
  }
  async function fetchAllAccounts() {
    const response = await fetch("https://asia-south1-mentorwise-384110.cloudfunctions.net/zoho-retriever");
    return response.json();
  }
  function mapAccountData(source) {
    return {
      name: source.Account_Name,
      address: `${source.Rue}, ${source.Code_postal} ${source.Ville}`,
      address_complement: source.Compl_ment_d_adresse,
      audioprothetist: source.Audioproth_siste,
      openingHours: source.Date_pr_sence_Audio ? source.Date_pr_sence_Audio.replace(',', '').replace(/"/g, '') : "",
      image: source.URL_Image_Centre,
      phone: source.Phone,
      prisederdv: source.Type_de_RDV,
      markerColor: source.Couleur_Picto,
      ...source
    };
  }

  async function initMap() {
    const data = await fetchAllAccounts();
    const centers = data.accounts.filter(center => center.Maison_m_re === false).map(mapAccountData);
    window.centers = centers;

    var center = { lat: 48.8566, lng: 2.3522 };
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: center,
      styles: [
        {
          featureType: 'poi',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });
    window.map = map;

    var geocoder = new google.maps.Geocoder();

    centers.forEach(function (center, index) {
      geocoder.geocode({ address: center.address }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          var location = results[0].geometry.location;
          var marker = new google.maps.Marker({
            map: map,
            position: location,
            icon: getMarkerIcon(center)
          });

          var infoWindowContent =
            '<div style="font-family: Arial, sans-serif; background-color: #fff; padding: 10px; border: 1px solid #333; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); width: 300px;">' +
            '<strong style="color: #ff5733; font-size: 18px;">' + center.name + '</strong><br>' +
            '<p style="font-size: 14px;"><strong>Heures d\'ouverture:</strong> ' + center.openingHours.replace(',', '').replace(/"/g, '') + '</p>' +
            '<p style="font-size: 14px;"><strong>Adresse:</strong> ' + center.address + '</p>' +
            '<p style="font-size: 14px;"><strong>Téléphone:</strong> ' + center.phone + '</p>' +
            "<p style='font-size: 14px;'><strong>Complément d'adresse:</strong> " + center.address_complement + '</p>' +
            '<p style="font-size: 14px;"><strong>Audioprothésiste:</strong> ' + center.audioprothetist + '</p>' +
            '<p style="font-size: 14px;"><strong>Prise de RDV:</strong> ' + center.prisederdv + '</p>' +
            '<img src="' + center.image + '" alt="Photo" style="width:100px; height:100px;"><br>' +
            '<button style="background-color: #007bff; color: #fff; padding: 5px 10px; border: none; cursor: pointer;" onclick="openDetailsPage(' + index + ')">Voir détails</button>' +
            '</div>';

          var infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
          });


          var infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
          });



          marker.addListener('click', function () {
            document.getElementById('end').value = center.address;

            // Fermer l'info-bulle précédente si elle est ouverte
            if (openInfoWindow) {
              openInfoWindow.close();
            }

            infoWindow.open(map, marker);
            openInfoWindow = infoWindow; // Mettre à jour l'info-bulle ouverte actuellement
          });

          markers.push(marker);

        } else {
          console.log("Erreur de géocodage pour l'adresse: " + center.address + ", statut: " + status);
        }
      });
    });

    var autocompleteStart = new google.maps.places.Autocomplete(
      document.getElementById('start'),
      { types: ['geocode'] }
    );

    autocompleteStart.setFields(['address_component']);
  }

  function getMarkerIcon(center) {
    markerColor = center.markerColor ? center.markerColor.toLowerCase() : "yellow"
    switch (markerColor) {
      case "red":
        return 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
      case "yellow":
        return 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
      case "blue":
        return 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      case "green":
        return 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
      case "ltblue":
        return 'https://maps.google.com/mapfiles/ms/icons/ltblue-dot.png'
      case "orange":
        return 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png'
      case "pink":
        return 'https://maps.google.com/mapfiles/ms/icons/pink-dot.png'
      case "purple":
        return 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png'
      default:
        return 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    }
  }

  function calculateDistance() {
    // Votre fonction de calcul de distance ici
    var startAddress = document.getElementById('start').value;
    var endAddress = document.getElementById('end').value;

    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: startAddress }, function (startResults, startStatus) {
      if (startStatus === google.maps.GeocoderStatus.OK) {
        var startLocation = startResults[0].geometry.location;

        geocoder.geocode({
          address: endAddress
        }, function (endResults, endStatus) {
          if (endStatus === google.maps.GeocoderStatus.OK) {
            var endLocation = endResults[0].geometry.location;

            var distanceService = new google.maps.DistanceMatrixService();
            distanceService.getDistanceMatrix({
              origins: [startLocation],
              destinations: [endLocation],
              travelMode: 'DRIVING'
            }, function (response, status) {
              if (status === 'OK') {
                var distance = response.rows[0].elements[0].distance.text;
                var duration = response.rows[0].elements[0].duration.text;

                var resultElement = document.getElementById('distance-result');
                resultElement.innerHTML = 'Distance: ' + distance + '<br>' + 'Duration: ' + duration;

                // Affichage du trajet sur la carte
                var directionsService = new google.maps.DirectionsService();
                var directionsDisplay = new google.maps.DirectionsRenderer({
                  map: map,
                  polylineOptions: {
                    strokeColor: 'blue'
                  }
                });

                var request = {
                  origin: startLocation,
                  destination: endLocation,
                  travelMode: 'DRIVING'
                };

                directionsService.route(request, function (result, status) {
                  if (status === 'OK') {
                    directionsDisplay.setDirections(result);
                  } else {
                    console.log('Erreur lors de l\'affichage du trajet: ' + status);
                  }
                });
              } else {
                console.log('Erreur de calcul de distance: ' + status);
              }
            });
          } else {
            console.log('Erreur de géocodage pour l\'adresse de destination: ' + endStatus);
          }
        });
      } else {
        console.log('Erreur de géocodage pour l\'adresse de départ: ' + startStatus);
      }
    });
  }

  function openDetailsPage(centerIndex) {
    var center = window.centers[centerIndex];

    var detailsPageContent =
      '<html>' +
      '<head>' +
      '<title>Détails du centre</title>' +
      '<style>' +
      '  body {' +
      '    font-family: Arial, sans-serif;' +
      '    background-color: #f4f4f4;' +
      '    margin: 0;' +
      '    padding: 20px;' +
      '  }' +
      '  .container {' +
      '    max-width: 800px;' +
      '    margin: 0 auto;' +
      '    background-color: #fff;' +
      '    padding: 20px;' +
      '    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);' +
      '    border-radius: 5px;' +
      '  }' +
      '  h1 {' +
      '    color: #333;' +
      '    font-size: 24px;' +
      '  }' +
      '  h2 {' +
      '    color: #555;' +
      '    font-size: 20px;' +
      '    margin-top: 10px;' +
      '  }' +
      '  p {' +
      '    color: #777;' +
      '    font-size: 16px;' +
      '  }' +
      '  strong {' +
      '    font-weight: bold;' +
      '  }' +
      '  img {' +
      '    max-width: 100%;' +
      '    height: auto;' +
      '    border: 1px solid #ddd;' +
      '    margin-top: 10px;' +
      '  }' +
      '</style>' +
      '</head>' +
      '<body>' +
      '<div class="container">' +
      '<h1>Détails du centre</h1>' +
      '<h2>' + center.name + '</h2>' +
      '<p><strong>Adresse:</strong> ' + center.address + '</p>' +
      "<p><strong>Complément d'adresse:</strong> " + center.address_complement + '</p>' +
      '<p><strong>Heures d\'ouverture:</strong> ' + center.openingHours.replace(',', '').replace(/"/g, '') + '</p>' +
      '<p><strong>Audioprothésiste:</strong> ' + center.audioprothetist + '</p>' +
      '<p><strong>Téléphone:</strong> ' + center.phone + '</p>' +
      //'<img src="' + center.image + '" alt="Photo">' +
      '</div>' +
      '</body>' +
      '</html>';

    var detailsWindow = window.open('', '_blank');
    detailsWindow.document.write(detailsPageContent);
    detailsWindow.document.close();
  }


  function expandAddress(inputId) {
    // Votre fonction pour développer l'adresse ici
    var addressElement = document.getElementById(field + '-address');
    var inputElement = document.getElementById(field);
    var fullAddress = addressElement.innerText;
    if (addressElement.title === fullAddress) {
      addressElement.innerText = fullAddress + ' ';
      inputElement.style.width = 'auto';
    } else {
      addressElement.innerText = fullAddress;
      inputElement.style.width = '';
    }
  }



  function focusStartInput() {
    // Votre fonction pour se concentrer sur l'entrée du départ ici
    var startInput = document.getElementById('start');
    startInput.focus();
  }
  document.getElementById('start').addEventListener('change', geocodeStartAddress);

  function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
    let date = new Date();
    setDate(date);
  }

  function initializeGapiClient() {
    return gapi.client.init({
      'apiKey': "AIzaSyBLx2sI2_nIAlAfQ10FKaq8s_2Zd7EhQVw",
      'clientId': "513516336164-5o81eom8k8s03lgsrj0gd4mp6auuu4d9.apps.googleusercontent.com",
      'scope': 'https://www.googleapis.com/auth/calendar.readonly',
      'cookiePolicy': 'single_host_origin',
      'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    }).then(loadAppointments);
  }

  //Format date to Paris UTC
  function setDate(date) {
    let formattedDate = date.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' });
    let parts = formattedDate.split('/');
    let outputDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // Remap to yyyy-mm-dd
    document.getElementById('date').value = outputDate;
  }

  //On user click next or previous date
  function changeDate(change) {
    const dateInput = document.getElementById('date');
    let date = new Date(dateInput.value);
    date.setDate(date.getDate() + change);
    dateInput.value = date.toISOString().split('T')[0];
    loadAppointments();
  }

  function loadAppointments() {
    const date = document.getElementById('date').value;
    getDayAppointments(date).then(function (items) {
      let appointments = '<ul>';
      items.forEach(function (appointment) {
        appointments += `
            <li>
                <strong>${appointment.summary}</strong>: 
                ${appointment.start.dateTime} - ${appointment.end.dateTime}
            </li>
                            `;
      });
      appointments += '</ul>';
      document.getElementById('appointments').innerHTML = appointments;
    });
  }


  async function getDayAppointments(date) {
    clearPreviousMarkers();

    let startDate = getStartDate(date);
    let endDate = getEndDate(date);

    return gapi.client.calendar.events.list({
      'calendarId': 'icmproductivity@gmail.com',
      'timeMin': startDate.toISOString(),
      'timeMax': endDate.toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'orderBy': 'startTime',
    }).then(function (response) {
      return response.result.items.map(function (appointment) {
        updateAppointmentDateTime(appointment);
        if (appointment.location) {
          addAppointmentMarker(appointment);
        }
        return appointment;
      });
    });
  }

  function clearPreviousMarkers() {
    if (window.eventMarkers) {
      window.eventMarkers.forEach(function (marker) {
        marker.setMap(null);
      });
    } else {
      window.eventMarkers = [];
    }
  }

  function getStartDate(date) {
    let startDate = new Date(date);
    const offset = startDate.getTimezoneOffset() + 1 * 60; // Add 2 hours for French timezone (UTC+2)
    return new Date(startDate.getTime() + offset * 60 * 1000);
  }

  function getEndDate(date) {
    let endDate = new Date(date);
    const offset = endDate.getTimezoneOffset() + 1 * 60; // Add 2 hours for French timezone (UTC+2)
    endDate = new Date(endDate.getTime() + (offset + 1) * 60 * 1000);
    endDate.setDate(endDate.getDate() + 1);
    return endDate;
  }

  function updateAppointmentDateTime(appointment) {
    // Convert time to french ones
    let start = new Date(appointment.start.dateTime);
    let end = new Date(appointment.end.dateTime);
    appointment.start.dateTime = start.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
    appointment.end.dateTime = end.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
  }

  function addAppointmentMarker(appointment) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: appointment.location }, function (results, status) {
      if (status === 'OK') {
        var marker = new google.maps.Marker({
          map: window.map,
          position: results[0].geometry.location,
          icon: 'http://maps.google.com/mapfiles/ms/icons/grn-pushpin.png' // Icône bleue
        });
        window.eventMarkers.push(marker);
        addMarkerListener(marker, appointment);
      } else {
        console.log('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  function addMarkerListener(marker, appointment) {
    var infoWindowContent =
      '<strong>' + appointment.summary + '</strong><br>' +
      '<strong>Start:</strong> ' + appointment.start.dateTime + '<br>' +
      '<strong>End:</strong> ' + appointment.end.dateTime + '<br>' +
      '<strong>Location:</strong> ' + appointment.location;

    var infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent
    });

    marker.addListener('click', function () {
      // Fermer l'info-bulle précédente si elle est ouverte
      if (openInfoWindow) {
        openInfoWindow.close();
      }

      infoWindow.open(map, marker);
      openInfoWindow = infoWindow; // Mettre à jour l'info-bulle ouverte actuellement
    });
  }
