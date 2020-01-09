$ = require('jquery')
require( 'datatables.net' )( window, $ );
$('#TabelWajibPajak').DataTable( {
    "scrollY": "60vh",
    "scrollCollapse": true,
    "paging": false,
    "searching": false,
    "ordering": false,
    "autoWidth": false,
});
const Store = require('./store.js')

// var URL = 'http://localhost/MonitoringPajak/Autentikasi/'
// var URL = 'http://192.168.43.223/MonitoringPajak/Autentikasi/'
var URL = 'http://192.168.1.92/MonitoringPajak/Autentikasi/'
var Edit = false

const store = new Store({
  configName: 'Auth',
  defaults: {}
})

$('#Simpan').on('click', () => {
	if ($('#NPWPD').val() == '') {
    	alert('Mohon Input NPWPD')
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
  			var DataWP = store.get('DataWP')
	  		var WP = {}
	  		WP['NPWPD'] = $('#NPWPD').val()
	  		WP['URL'] = $('#URL').val()
	  		WP['Waktu'] = $('#Waktu').val()
	  		WP['Status'] = '0'
	  		DataWP.push(WP)
	  		store.set('DataWP', DataWP)
	  		manageRow(store.get('DataWP'))
  		}
  	}
})

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
	$.each( data, function( key, value ) {
	  	rows = rows + '<tr>';
	  	rows = rows + '<td>'+value.NPWPD+'</td>';
	  	rows = rows + '<td>'+value.URL+'</td>';
        rows = rows + '<td>'+value.Waktu+'</td>';
        rows = rows + '<td style="width: 140px;">';
        if (value.Status == '0') {
        	rows = rows + '<select onchange="Status(this)" class="form-control btn-sm" Status="'+value.NPWPD+'"><option value="0" selected><b>Enable</b></option><option value="1"><b>Disable</b></option></select>';
        } else {
        	rows = rows + '<select onchange="Status(this)" class="form-control btn-sm" Status="'+value.NPWPD+'"><option value="0"><b>Enable</b></option><option value="1" selected><b>Disable</b></option></select>';
        }
        rows = rows + '</td>';
	  	rows = rows + '<td>';
        rows = rows + '<a href="#" EditWP="'+value.NPWPD+'" class="edit"><i class="material-icons" title="Edit">&#xE254;</i></a>';
        rows = rows + '<a href="#" HapusWP="'+value.NPWPD+'" class="delete"><i class="material-icons" title="Delete">&#xE872;</i></a>';
        rows = rows + '</td>';
	  	rows = rows + '</tr>';
	});
 
	$("tbody").html(rows);
}