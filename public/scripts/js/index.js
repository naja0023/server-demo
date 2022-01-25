// const { route } = require("../../../routes/auth-routes");

var lat
var lng
var _lat
var _lng
    // var _state
var beachMarker = []
var connection = new WebSocket('ws://103.76.182.124:34000')
    // var connection = new WebSocket('wss://pytransit.szo.me')
var array = []
var current_lat
var current_lng
var user_email
var user_name
var driver_id
var id
var info_
var score
var comment
var ratestatus
var dataCar
connection.onopen = function() {
    // จะทำงานเมื่อเชื่อมต่อสำเร็จ
    console.log('connect webSocket')
        // connection.send("Hello ESUS"); // ส่ง Data ไปที่ Server
}
connection.onerror = function(error) {
    console.error('WebSocket Error ' + error)
}

var maps
    // var position = { lat: current_lat, lng: current_lng};

function geocoderAddress(geocoder, resultsMap) {
    var address = document.getElementById('address').value
    geocoder.geocode({ address: address }, function(results, status) {
        if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location)
            var marker = new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location,
            })
        } else {
            alert('Geocode was not successful for the following reason: ' + status)
        }
    })
}

function getLocation() {
    //console.log('hi')
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition)
    } else {
        alert('Geolocation is not supported by this browser.')
    }
}

function showPosition(position) {
    current_lat = position.coords.latitude
    current_lng = position.coords.longitude
}

$(document).ready(function() {
    getLocation()
    setInterval(checksendrequest, 1000) //ทำทุก 1 วินาที
    $('#close').click(function() {
        $('.popup_box').css({
            opacity: '',
            'pointer-events': 'auto',
        })
    })

    $('#eiei').click(function() {
        $('.popup_box').css({
            opacity: '1',
            'pointer-events': 'auto',
        })
    })
    $('.btn1').click(function() {
        $('.popup_box').css({
            opacity: '1',
            'pointer-events': 'none',
        })
        requesttodb(1)
        checksendrequest()
    })
    $('.btn2').click(function() {
        $('.popup_box').css({
            opacity: '1',
            'pointer-events': 'none',
        })
        requesttodb(0)
        checksendrequest()
    })
    $('#Logout').click(function(e) {
        e.preventDefault()
        window.location.replace('/auth/logout')
    })

    $('#star5').click(function() {
        ratestatus = 'ปรับปรุง'
        document.getElementById('ratestatus').innerHTML = ratestatus
    })
    $('#star4').click(function() {
        ratestatus = 'พอใช้'
        document.getElementById('ratestatus').innerHTML = ratestatus
    })

    $('#star3').click(function() {
        ratestatus = 'ปานกลาง'
        document.getElementById('ratestatus').innerHTML = ratestatus
    })
    $('#star2').click(function() {
        ratestatus = 'ดี'
        document.getElementById('ratestatus').innerHTML = ratestatus
    })
    $('#star1').click(function() {
        ratestatus = 'ดีมาก'
        document.getElementById('ratestatus').innerHTML = ratestatus
    })

    // var score_ = $('.fa-star').val()
    // // console.log(score_)
    $('#sendinfo').click(function() {
        score = $('.fa-star').val()
            // console.log(score)
        var point = document.getElementsByName('star')
        console.log(point)
        for (let i = 0; i < point.length; i++) {
            if (point[i].checked) {
                if (point[i].value == 5) {
                    score = 1
                    console.log(score)
                } else if (point[i].value == 1) {
                    score = 5
                    console.log(score)
                } else if (point[i].value == 2) {
                    score = 4
                    console.log(score)
                } else if (point[i].value == 4) {
                    score = 2
                    console.log(score)
                } else {
                    score = point[i].value
                    console.log(score)
                }
            }
            comment = $('.getdata').val()
        }

        $.ajax({
            type: 'POST',
            url: '/review',
            data: {
                user_email: user_email,
                user_name: user_name,
                driver_id: driver_id,
                point: score,
                report: comment,
            },
            success: function(response) {
                Swal.fire({
                    title: 'ให้คะแนนสำเร็จ✔✔✔',
                    text: 'ขอขอบคุณสำหรับความคิดเห็น',
                    icon: 'success',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Yes',
                }).then((result) => {
                    if (result.isConfirmed) {
                        sessionStorage.setItem('requestid', response)
                        var x = document.getElementById('review')
                        var y = document.getElementById('eiei')
                            // x.style.display = 'none'
                            // y.style.display = 'block'
                        sessionStorage.removeItem('requestid')
                        checksendrequest()
                        window.location.reload()
                    }
                })
            },
            error: function(xhr) {
                Swal.fire({
                    icon: 'error',
                    title: xhr.responseText,
                })
            },
        })
    })
})

function requesttodb(direction) {
    $('.popup_box').css({
        opacity: '0',
        'pointer-events': 'auto',
    })
    $.ajax({
        type: 'POST',
        url: '/request',
        data: {
            user_email: user_email,
            user_name: user_name,
            lat: current_lat,
            lng: current_lng,
            route: direction,
        },
        success: function(response) {
            Swal.fire({
                title: 'เรียกรถสำเร็จ✔✔✔',
                text: 'โปรดรอ... คนขับรถกำลังจะมารับท่าน',
                icon: 'success',
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Yes',
            }).then((result) => {
                if (result.isConfirmed) {
                    sessionStorage.setItem('lat', current_lat)
                    sessionStorage.setItem('lng', current_lng)
                    sessionStorage.setItem('requestid', response)
                    window.location.replace('/mapping')
                }
            })
        },
        error: function(xhr) {
            Swal.fire({
                icon: 'error',
                title: xhr.responseText,
            })
        },
    })
}

function check_request() {
    $.ajax({
        type: 'POST',
        url: '/request',
        data: {
            user_email: user_email,
            user_name: user_name,
            lat: current_lat,
            lng: current_lng,
            route: direction,
        },
        success: function(response) {
            Swal.fire({
                title: 'เรียกรถสำเร็จ✔✔✔',
                text: 'โปรดรอ... คนขับรถกำลังจะมารับท่าน',
                icon: 'success',
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Yes',
            }).then((result) => {
                if (result.isConfirmed) {
                    sessionStorage.setItem('lat', current_lat)
                    sessionStorage.setItem('lng', current_lng)
                    sessionStorage.setItem('requestid', response)
                    window.location.replace('/mapping')
                }
            })
        },
        error: function(xhr) {
            Swal.fire({
                icon: 'error',
                title: xhr.responseText,
            })
        },
    })
}

function checksendrequest() {
    var request = sessionStorage.getItem('requestid')
    if (request) {
        var x = document.getElementById('review')
        var y = document.getElementById('eiei')
            // x.style.display = 'none'
            // y.style.display = 'none'

        $.ajax({
            type: 'POST',
            url: '/requestinfo',
            data: { requestdata: request },
            success: function(response) {
                if (response[0].res_driver) {
                    driver_id = response[0].res_driver
                        //   x.style.display = 'block'
                }
            },
            error: function(xhr) {
                Swal.fire({
                    icon: 'error',
                    title: xhr.responseText,
                })
            },
        })
    } else {
        var x = document.getElementById('review')
        var y = document.getElementById('eiei')
        sessionStorage.removeItem('lat')
        sessionStorage.removeItem('lng')
            //setmarker()
            // y.style.display = 'block'
            // x.style.display = 'none'
    }
}

function getemail() {
    $.ajax({
        type: 'GET',
        url: '/verify',
        success: function(response) {
            user_email = response.email
            user_name = response.name
        },
        error: function(xhr) {
            Swal.fire({
                icon: 'error',
                title: xhr.responseText,
            })
        },
    })
}

function getcarmatch() {
    $.ajax({
        type: 'GET',
        url: '/carmatch',
        success: function(response) {
            dataCar = response
        },
        error: function(xhr) {
            Swal.fire({
                icon: 'error',
                title: xhr.responseText,
            })
        },
    })
    return dataCar
}

// This example creates a 2-pixel-wide red polyline showing the path of
// the first trans-Pacific flight between Oakland, CA, and Brisbane,
// Australia which was made by Charles Kingsford Smith.

function initMap() {
    getcarmatch()

    // const directionsService = new google.maps.DirectionsService()
    // const directionsRenderer = new google.maps.DirectionsRenderer({
    //     suppressMarkers: true,
    // })
    const map = new google.maps.Map(document.getElementById('map'), {

        center: { lat: 18.785821, lng: 100.776819 },
        zoom: 15,


    });
    // Define the LatLng coordinates for the polygon's path.
    const NaiWiangCoords = [
        { lat: 18.776493, lng: 100.763407 },
        { lat: 18.776772, lng: 100.773223 },
        { lat: 18.778136, lng: 100.773732 },
        { lat: 18.782137, lng: 100.773580 },
        { lat: 18.783968, lng: 100.772685 },
        { lat: 18.785182, lng: 100.771585 },
        { lat: 18.786346, lng: 100.771092 },
        { lat: 18.787639, lng: 100.771122 },
        { lat: 18.789463, lng: 100.772799 },
        { lat: 18.790454, lng: 100.775697 },
        { lat: 18.790799, lng: 100.779877 },
        { lat: 18.791851, lng: 100.780132 },
        { lat: 18.796585, lng: 100.779424 },
        { lat: 18.798143, lng: 100.779360 },
        { lat: 18.801640, lng: 100.781238 },
        { lat: 18.805982, lng: 100.785391 },
        { lat: 18.805559, lng: 100.787012 },
        { lat: 18.805043, lng: 100.786919 },
        { lat: 18.802735, lng: 100.790993 },
        { lat: 18.800825, lng: 100.794058 },
        { lat: 18.799457, lng: 100.792791 },
        { lat: 18.797920, lng: 100.791797 },
        { lat: 18.794700, lng: 100.790842 },
        { lat: 18.789827, lng: 100.791227 },
        { lat: 18.788263, lng: 100.790948 },
        { lat: 18.785262, lng: 100.788828 },
        { lat: 18.779259, lng: 100.783721 },
        { lat: 18.778446, lng: 100.783131 },
        { lat: 18.776965, lng: 100.782710 },
        { lat: 18.776215, lng: 100.782022 },
        { lat: 18.773156, lng: 100.776947 },
        { lat: 18.771525, lng: 100.775263 },
        { lat: 18.770249, lng: 100.774549 },
        { lat: 18.768015, lng: 100.773836 },
        { lat: 18.766937, lng: 100.772630 },
        { lat: 18.766592, lng: 100.771841 },
        { lat: 18.766226, lng: 100.768328 },
        { lat: 18.765127, lng: 100.766515 },
        { lat: 18.764347, lng: 100.766074 },
        { lat: 18.764625, lng: 100.765589 },
        { lat: 18.765084, lng: 100.765232 },
        { lat: 18.765724, lng: 100.764913 },
        { lat: 18.766293, lng: 100.764913 },
        { lat: 18.766993, lng: 100.764976 },
        { lat: 18.767403, lng: 100.765048 },
        { lat: 18.767975, lng: 100.765120 },
        { lat: 18.768488, lng: 100.765391 },
        { lat: 18.768898, lng: 100.765698 },
        { lat: 18.769069, lng: 100.766059 },
        { lat: 18.769547, lng: 100.766311 },
        { lat: 18.770068, lng: 100.767006 },
        { lat: 18.770384, lng: 100.767159 },
        { lat: 18.770615, lng: 100.767087 },
        { lat: 18.770769, lng: 100.766744 },
        { lat: 18.770931, lng: 100.766095 },
        { lat: 18.770977, lng: 100.765537 },
        { lat: 18.770933, lng: 100.765082 },
        { lat: 18.770869, lng: 100.764779 },
        { lat: 18.771005, lng: 100.764604 },
        { lat: 18.771400, lng: 100.764536 },
        { lat: 18.772097, lng: 100.763837 },
        { lat: 18.772814, lng: 100.763657 },
        { lat: 18.773267, lng: 100.763124 },
        { lat: 18.773634, lng: 100.762664 },
        { lat: 18.774070, lng: 100.762502 },
        { lat: 18.774770, lng: 100.762482 },
        { lat: 18.776493, lng: 100.763407 }
    ];
    // Construct the polygon.
    const routeOfNaiWiang = new google.maps.Polygon({
        paths: NaiWiangCoords,
        strokeColor: "#92A284",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#E6FFD7",
        fillOpacity: 0.35,

    });

    routeOfNaiWiang.setMap(map);


    // directionsRenderer.setMap(map)
    // calculateAndDisplayRoute(directionsService, directionsRenderer)
    var greeen = '/image/carGreen.png'
    var yelow = '/image/carYelow.png'
    var blue = '/image/carBlue.png'
    var red = '/image/carRed.png'
        // beachMarker = new google.maps.Marker({
        //     position: (lat, lng),
        //     map: map,
        //     icon: image,
        //     id: 1
        // });

    //console.log(dataCar)
    var myMarkers = new Array()
    $.ajax({
        type: 'GET',
        url: '/carmatch',
        success: function(response) {
            for (let index = 0; index < response.length; index++) {
                myMarkers[index] = addMarker(
                    map,
                    response[index].info,
                    response[index].type,
                )
            }
        },
        error: function(xhr) {
            Swal.fire({
                icon: 'error',
                title: xhr.responseText,
            })
        },
    })

    function addMarker(map, info, type) {
        //create the markers
        const infowindow = new google.maps.InfoWindow({
            content: info,
        })
        if (type == 1) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                map: map,
                icon: greeen,
                type: 1,
            })
        } else if (type == 2) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                map: map,
                icon: blue,
                type: 2,
            })
        } else if (type == 3) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                map: map,
                icon: yelow,
                type: 3,
            })
        } else {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                map: map,
                icon: red,
            })
        }

        marker.addListener('click', () => {
            infowindow.open({
                anchor: marker,
                map,
                shouldFocus: false,
            })
        })
        return marker
    }

    connection.onmessage = function(e) {
        var obj = JSON.parse(e.data)
            // console.log(obj)
            //ty(map, array)
        var index = dataCar.findIndex(
                (std) => JSON.stringify(std.driver_id) === obj.topic,
            )
            //console.log(index)
        var latlng = new google.maps.LatLng(obj.lat, obj.lng)
        myMarkers[index].setPosition(latlng)
            // console.log(myMarkers[index].type)
            // if (index) myMarker[index].setVisible(false)
        if (obj.status == '0') {
            myMarkers[index].setPosition(lat, lng)
        }
    }

    $('#alltype').click(function() {
        for (let i = 0; i < myMarkers.length; i++) {
            myMarkers[i].setVisible(true)
        }
    })
    $('#type1').click(function() {
        for (let j = 0; j < myMarkers.length; j++) {
            if (myMarkers[j].type != 1) {
                myMarkers[j].setVisible(false)
            } else {
                myMarkers[j].setVisible(true)
            }
        }
    })
    $('#type2').click(function() {
        for (let j = 0; j < myMarkers.length; j++) {
            if (myMarkers[j].type != 2) {
                myMarkers[j].setVisible(false)
            } else {
                myMarkers[j].setVisible(true)
            }
        }
    })
    $('#type3').click(function() {
        for (let j = 0; j < myMarkers.length; j++) {
            if (myMarkers[j].type != 3) {
                myMarkers[j].setVisible(false)
            } else {
                myMarkers[j].setVisible(true)
            }
        }
    })
    $('#type4').click(function() {
        for (let j = 0; j < myMarkers.length; j++) {
            if (myMarkers[j].type != 4) {
                myMarkers[j].setVisible(false)
            } else {
                myMarkers[j].setVisible(true)
            }
        }
    })

    infoWindow = new google.maps.InfoWindow()

    const locationButton = document.createElement('button')

    locationButton.classList.add('custom-map-control-button')
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton)
        // addEventListener("click", () => {
    if (sessionStorage.getItem('lat') && sessionStorage.getItem('lng')) {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }
                    myMarker = new google.maps.Marker({
                            position: pos,
                            map: map,
                        })
                        // infoWindow.setPosition(pos);
                        // infoWindow.setContent("Location found.");
                        // infoWindow.open(map);
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter())
                },
            )
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter())
        }
    }
    // });
    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos)
        infoWindow.setContent(
            browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            "Error: Your browser doesn't support geolocation.",
        )
        infoWindow.open(map)
    }
}

// function calculateAndDisplayRoute(directionsService, directionsRenderer) {
//     var waypts = []

//     stop = new google.maps.LatLng(19.161438, 99.913639)
//     waypts.push({
//         location: stop,
//         stopover: true,
//     })
//     stop = new google.maps.LatLng(19.168859, 99.903858)
//     waypts.push({
//         location: stop,
//         stopover: true,
//     })
//     stop = new google.maps.LatLng(19.172269, 99.898099)
//     waypts.push({
//         location: stop,
//         stopover: true,
//     })
//     stop = new google.maps.LatLng(19.170169, 99.897192)
//     waypts.push({
//         location: stop,
//         stopover: true,
//     })

//     directionsService
//         .route({
//             origin: '19.030976, 99.926385',
//             destination: '19.030976, 99.926385',
//             travelMode: google.maps.TravelMode.DRIVING,
//             waypoints: waypts,
//         })
//         .then((response) => {
//             directionsRenderer.setDirections(response)
//         })
//         .catch((e) => window.alert('Directions request failed due to ' + status))
// }