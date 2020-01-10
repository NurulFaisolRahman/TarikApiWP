$ = require('jquery')
const Store = require('./store.js')
const moment = require('moment')
const schedule = require('node-schedule')

var URL = 'http://localhost/MonitoringPajak/Autentikasi/'
// var URL = 'http://192.168.43.223/MonitoringPajak/Autentikasi/'
// var URL = 'http://192.168.1.92/MonitoringPajak/Autentikasi/'
var Edit = false

const store = new Store({
  configName: 'Auth',
  defaults: {}
})

window.addEventListener('offline', () => {
  alert('Internet Offline')
  $.each( store.get('DataWP'), function( key, value ) {
	if (window['Sinyal'+value.IdWP] != undefined) {
		window['Sinyal'+value.IdWP].cancel()
	}
	if (window['Buka'+value.IdWP] != undefined) {
		window['Buka'+value.IdWP].cancel()
	}
	if (window['Tutup'+value.IdWP] != undefined) {
		window['Tutup'+value.IdWP].cancel()
	}
	if (window['Kirim'+value.IdWP] != undefined) {
		window['Kirim'+value.IdWP].cancel()
	}
  })
  console.log('AutoPilot Offline Detection Executed')
})

window.addEventListener('online', () => {
  	$.each( store.get('DataWP'), function( key, value ) {
    	Jadwal(value.IdWP,value.JamBuka,value.JamTutup,value.Waktu,value.URL)
    })
    console.log('AutoPilot Online Detection Executed')
})

if (store.get('DataWP') != undefined && store.get('DataWP') != '') {
	$.each( store.get('DataWP'), function( key, value ) {
    	Jadwal(value.IdWP,value.JamBuka,value.JamTutup,value.Waktu,value.URL)
    })
}

function Jadwal(InputNPWPD,JamBuka,JamTutup,WaktuPengiriman,ApiUrl) {
  window['Sinyal'+InputNPWPD] = schedule.scheduleJob('*/1 * * * *', function(){
    if (parseInt(moment().format('HH')) >= JamBuka && parseInt(moment().format('HH')) < JamTutup) {
      var DataSinyal = { NPWPD: InputNPWPD.substr(0, 4)+'.'+InputNPWPD.substr(4, 2)+'.'+InputNPWPD.substr(6, 3), Sinyal: moment().format('YYYY-MM-DD HH:mm:ss') }
      $.post(URL+"UpdateSinyal", DataSinyal)
      console.log(InputNPWPD+' Kirim Sinyal Online Sukses')
    }
  })
  window['Buka'+InputNPWPD] = schedule.scheduleJob('0 0 '+JamBuka+' * * *', function(){
      window['Sinyal'+InputNPWPD] = schedule.scheduleJob('*/1 * * * *', function(){
	    if (parseInt(moment().format('HH')) >= JamBuka && parseInt(moment().format('HH')) < JamTutup) {
	      var DataSinyal = { NPWPD: InputNPWPD.substr(0, 4)+'.'+InputNPWPD.substr(4, 2)+'.'+InputNPWPD.substr(6, 3), Sinyal: moment().format('YYYY-MM-DD HH:mm:ss') }
	      $.post(URL+"UpdateSinyal", DataSinyal)
	      console.log(InputNPWPD+' Kirim Sinyal Online Sukses')
	    }
	  })
      console.log('Jam Buka')
  })
  window['Tutup'+InputNPWPD] = schedule.scheduleJob('0 0 '+JamTutup+' * * *', function(){
      window['Sinyal'+InputNPWPD].cancel()
      console.log(InputNPWPD+' Jam Tutup')
  })
  	window['Kirim'+InputNPWPD] = schedule.scheduleJob('*/'+WaktuPengiriman+' * * * *', function(){
		if (parseInt(moment().format('HH')) >= JamBuka && parseInt(moment().format('HH')) < JamTutup) {
			$.post(ApiUrl).done(function(DataJson) {
				var DataWP = {}
		      	DataWP[InputNPWPD.substr(0, 4)+'.'+InputNPWPD.substr(4, 2)+'.'+InputNPWPD.substr(6, 3)] = JSON.parse(DataJson)
		      	// console.log(DataWP)
		      	$.post(URL+"InputTransaksiWajibPajak", JSON.stringify(DataWP)).done(function(respon) {
		        	if (respon == 'ok') {
		          		console.log(InputNPWPD+' Otomatis, Sukses')
		        	} else {
		        		alert('Upload Data Api Otomatis, Gagal')
		        		window['Kirim'+InputNPWPD].cancel()
		          		console.log(respon)
		       		}
		      	})
	        })
		}
  	})
}

function TambahWP(UrlApi){
	var Akun = { NPWPD: $('#NPWPD').val(),Password: $('#Password').val() }
	$.post(URL+"/AutentikasiWajibPajak", Akun).done(function(pesan) {
		if (pesan == 'ok' || pesan == 'api') {
			var Koneksi = { NPWPD: $('#NPWPD').val(), JenisData: 'api' }
			$.post(URL+"UpdateJenisData", Koneksi)
	        var npwpd = { NPWPD : $('#NPWPD').val()};
	        $.post(URL+"/JamOperasional", npwpd).done(function(Respon) {
	          	var Pecah1 = Respon.split("-")
	          	var Pecah2 = Pecah1[0].split(".")
	          	var Pecah3 = Pecah1[1].split(".")
	          	var Buka = parseInt(Pecah2[0])
	          	var Tutup = parseInt(Pecah3[0])
	          	var SplitNPWPD = $('#NPWPD').val().split(".")
	          	var IdWP = SplitNPWPD[0]+SplitNPWPD[1]+SplitNPWPD[2]
	          	Jadwal(IdWP,Buka,Tutup,$('#Waktu').val(),UrlApi)
			    if (store.get('DataWP') == undefined) {
		    		var dataWP = []
			  	}
			  	else {
			  		var dataWP = store.get('DataWP')
			  	}
		  	  	var WP = {}
		  	  	WP['NPWPD'] = $('#NPWPD').val()
		  	 	WP['URL'] = $('#URL').val()
		  	  	WP['Waktu'] = $('#Waktu').val()
		  	  	WP['Status'] = '0'
		  	  	WP['JamBuka'] = Buka
		  	  	WP['JamTutup'] = Tutup
		  	  	WP['IdWP'] = IdWP
		  	  	dataWP.push(WP)								  	  	
		  	  	store.set('DataWP', dataWP)
		  	  	manageRow(store.get('DataWP'))
		  	  	document.getElementById("NPWPD").value = ''
	    		document.getElementById("Password").value = ''
	    		document.getElementById("URL").value = ''
	    		document.getElementById("Waktu").value = ''
		        alert('Wajib Pajak Berhasil Ditambahkan')
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
    		document.getElementById("Password").disabled = false
    		document.getElementById("Password").value = ''
    		document.getElementById("URL").value = ''
    		document.getElementById("Waktu").value = ''
    		Edit = false
  		} else {
  			$.post($('#URL').val()).done(function(ResponJson) {
			    if (IsJson(ResponJson)){
			      	var datawp = store.get('DataWP')
			      	if (datawp == undefined || datawp == '') {
			      		TambahWP($('#URL').val())
			      	} 
			      	else {
			      		$.each( datawp, function( key, value ) {
					    	if (value.NPWPD == document.getElementById("NPWPD").value) {
					    		alert('NPWPD Sudah Ada')
					    		return false
					    	}
					    	else {
					    		TambahWP($('#URL').val())
					    	}
					    })
			      	}
			    }
			    else {
			      alert('Respon Data Bukan JSON!')
			    }
			    document.getElementById("ApiData").value = ResponJson
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
    		document.getElementById("Password").value = ''
    		document.getElementById("Password").disabled = true
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
		    		if (window['Sinyal'+value.IdWP] != undefined) {
						window['Sinyal'+value.IdWP].cancel()
					}
					if (window['Buka'+value.IdWP] != undefined) {
						window['Buka'+value.IdWP].cancel()
					}
					if (window['Tutup'+value.IdWP] != undefined) {
						window['Tutup'+value.IdWP].cancel()
					}
					if (window['Kirim'+value.IdWP] != undefined) {
						window['Kirim'+value.IdWP].cancel()
					}
		    		console.log(value.IdWP+' AutoPilot Deleted')
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
    		if (status.value == '0') {
    			Jadwal(value.IdWP,value.JamBuka,value.JamTutup,value.Waktu,value.URL)
    			console.log(value.IdWP+' AutoPilot Enabled')
    		} else {
    			if (window['Sinyal'+value.IdWP] != undefined) {
					window['Sinyal'+value.IdWP].cancel()
				}
				if (window['Buka'+value.IdWP] != undefined) {
					window['Buka'+value.IdWP].cancel()
				}
				if (window['Tutup'+value.IdWP] != undefined) {
					window['Tutup'+value.IdWP].cancel()
				}
				if (window['Kirim'+value.IdWP] != undefined) {
					window['Kirim'+value.IdWP].cancel()
				}
	    		console.log(value.IdWP+' AutoPilot Disabled')
    		}
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
	$.each( data, function( key, value ) {
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