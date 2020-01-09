$ = require('jquery')
const Store = require('./store.js')
const moment = require('moment')
const schedule = require('node-schedule')

var URL = 'http://localhost/MonitoringPajak/Autentikasi/'
// var URL = 'http://192.168.43.223/MonitoringPajak/Autentikasi/'
// var URL = 'http://192.168.1.92/MonitoringPajak/Autentikasi/'
var Edit = false
var SinyalOnline

const store = new Store({
  configName: 'Auth',
  defaults: {}
})

function KirimSinyalOnline(IdWP) {
  SinyalOnline = schedule.scheduleJob('*/5 * * * * *', function(){
    if (parseInt(moment().format('HH')) >= store.get('JamBuka') && parseInt(moment().format('HH')) < store.get('JamTutup')) {
      var DataSinyal = { NPWPD: IdWP, Sinyal: moment().format('YYYY-MM-DD HH:mm:ss') }
      $.post(URL+"UpdateSinyal", DataSinyal)
      console.log('Kirim Sinyal Online Sukses')
    }
  })
}

function Jadwal(InputNPWPD) {
  KirimSinyalOnline(InputNPWPD)
  var Buka = schedule.scheduleJob('0 0 '+store.get('JamBuka')+' * * *', function(){
      KirimSinyalOnline(InputNPWPD)
      console.log('Jam Buka')
  })
  var Tutup = schedule.scheduleJob('0 0 '+store.get('JamTutup')+' * * *', function(){
      SinyalOnline.cancel()
      console.log('Jam Tutup')
  })
}

$('#Simpan').on('click', () => {
	if ($('#NPWPD').val() == '') {
    	alert('Mohon Input NPWPD')
  	}
  	else if ($('#Password').val() == '') {
    	alert('Mohon Input Password')
  	}
  	else if ($('#URL').val() == '') {
    	alert('Mohon Input URL')
  	}
  	else if ($('#Waktu').val() == '') {
    	alert('Mohon Input Waktu Penarikan')
  	}
  	else {
  		if (Edit) {
  			var datawp = store.get('DataWP')
		    $.each( datawp, function( key, value ) {
		    	if (value.NPWPD == document.getElementById("NPWPD").value) {
		    		value.URL = $('#URL').val()
		    		value.Waktu = $('#Waktu').val()
		    		store.set('DataWP', datawp)
	  				manageRow(store.get('DataWP'))
		    		return false
		    	}
		    })
  			document.getElementById("NPWPD").value = ''
    		document.getElementById("NPWPD").disabled = false
    		document.getElementById("URL").value = ''
    		document.getElementById("Waktu").value = ''
    		Edit = false
  		} else {
  			$.post($('#URL').val()).done(function(Respon) {
			    if (IsJson(Respon)){
			      	var datawp = store.get('DataWP')
				    $.each( datawp, function( key, value ) {
				    	if (value.NPWPD == document.getElementById("NPWPD").value) {
				    		alert('NPWPD Sudah Ada')
				    		return false
				    	}
				    	else {
				    		var Akun = { NPWPD: $('#NPWPD').val(),Password: $('#Password').val() }
    						$.post(URL+"/AutentikasiWajibPajak", Akun).done(function(pesan) {
				    			if (pesan == 'ok') {
				    				var Koneksi = { NPWPD: $('#NPWPD').val(), JenisData: 'api' }
  									$.post(URL+"UpdateJenisData", Koneksi)
							        var npwpd = { NPWPD : $('#NPWPD').val()};
							        $.post(URL+"/JamOperasional", npwpd).done(function(Respon) {
							          var Pecah1 = Respon.split("-")
							          var Pecah2 = Pecah1[0].split(".")
							          var Pecah3 = Pecah1[1].split(".")
							          store.set('JamBuka', parseInt(Pecah2[0]))
							          store.set('JamKirim', parseInt(parseInt(Pecah2[0]) + ((parseInt(Pecah3[0]) - parseInt(Pecah2[0]))/2)))
							          store.set('JamTutup', parseInt(Pecah3[0]))
							          Jadwal($('#NPWPD').val())
							          console.log('Jadwal Started')
							        })
							    } else if(pesan == 'ko'){
							   	    alert('NPWPD Tidak Terdaftar DiServer')
							    } else if (pesan == 'fail') {
							        alert('Password Salah')
							    } else if (pesan == 'Disable') {
							        alert('Akun Di Non Aktifkan Oleh Server')
							    }
				    		}).fail(function(e) {
						      	alert('Koneksi Gagal')
						    })
				    	}
				    })
			      	// var DataWajibPajak = {}
			     	 // DataWajibPajak[$('#URL').val()] = JSON.parse(Respon)
			      	// $.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWajibPajak)).done(function(Respon) {
			      	//   if (Respon == 'ok') {
			      	//     alert('Data Berhasil Di Upload')
			     	//   } else {
			      	//     alert(Respon)
			      	//   }
			      	// })
			      	// var DataWP = store.get('DataWP')
			  	  	// var WP = {}
			  	  	// WP['NPWPD'] = $('#NPWPD').val()
			  	 	 // WP['URL'] = $('#URL').val()
			  	  	// WP['Waktu'] = $('#Waktu').val()
			  	  	// WP['Status'] = '0'
			  	  	// DataWP.push(WP)
			  	  	// store.set('DataWP', DataWP)
			  	  	// manageRow(store.get('DataWP'))
			    }
			    else {
			      alert('Respon Data Bukan JSON!')
			    }
			    document.getElementById("ApiData").value = Respon
		  	}).fail(function() {
		    	alert('URL Tidak Valid!')
		  	})
  		}
  	}
})

function IsJson(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

$(document).on("click",".edit",function(){
	var editWP = $(this).attr('EditWP')
	var datawp = store.get('DataWP')
    $.each( datawp, function( key, value ) {
    	if (value.NPWPD == editWP) {
    		document.getElementById("NPWPD").value = value.NPWPD
    		document.getElementById("NPWPD").disabled = true
    		document.getElementById("URL").value = value.URL
    		document.getElementById("Waktu").value = value.Waktu
    		Edit = true
    		return false
    	}
    })
})

$(document).on("click",".delete",function(){
	if (Edit) {
		alert('Mohon Simpan Data Yang Sedang Di Edit')
	} else {
		var hapusWP = $(this).attr('HapusWP')
		var Konfirmasi = confirm("Yakin Ingin Menghapus Data?");
	    if (Konfirmasi == true) {
	    	var datawp = store.get('DataWP')
		    $.each( datawp, function( key, value ) {
		    	if (value.NPWPD == hapusWP) {
		    		datawp.splice(key,1)
		    		store.set('DataWP', datawp)
		    		manageRow(store.get('DataWP'))
		    		return false
		    	}
		    })
	    }
	}
})

function Status(status){
	var datawp = store.get('DataWP')
    $.each( datawp, function( key, value ) {
    	if (value.NPWPD == $(status).attr('Status')) {
    		value.Status = status.value
    		store.set('DataWP', datawp)
    		return false
    	}
    })
}

manageRow(store.get('DataWP'))
/* tambahkan data baru pada table */
function manageRow(data) {
	var	rows = '';
	$.each( data.reverse(), function( key, value ) {
	  	rows = rows + '<tr>';
	  	rows = rows + '<td>'+value.NPWPD+'</td>';
	  	rows = rows + '<td>'+value.URL+'</td>';
        rows = rows + '<td>'+value.Waktu+'</td>';
        rows = rows + '<td>';
        if (value.Status == '0') {
        	rows = rows + '<select onchange="Status(this)" class="form-control btn-sm" Status="'+value.NPWPD+'"><option value="0" selected><b>Enable</b></option><option value="1"><b>Disable</b></option></select>';
        } else {
        	rows = rows + '<select onchange="Status(this)" class="form-control btn-sm" Status="'+value.NPWPD+'"><option value="0"><b>Enable</b></option><option value="1" selected><b>Disable</b></option></select>';
        }
        rows = rows + '</td>';
	  	rows = rows + '<td>';
        rows = rows + '<a href="#" EditWP="'+value.NPWPD+'" class="edit"><i class="material-icons" title="Edit">&#xE254;</i></a>';
        rows = rows + '&nbsp;&nbsp;&nbsp;<a href="#" HapusWP="'+value.NPWPD+'" class="delete"><i class="material-icons" title="Delete">&#xE872;</i></a>';
        rows = rows + '</td>';
	  	rows = rows + '</tr>';
	});
 
	$("tbody").html(rows);
}