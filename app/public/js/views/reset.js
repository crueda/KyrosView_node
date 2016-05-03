
$(document).ready(function(){
	
	var rv = new ResetValidator();
	
	$('#set-password-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){;
			rv.hideAlert();
			if (rv.validatePassword($('#pass-tf').val()) == false){
				return false;
			} 	else{
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
            console.log(">>>");
			rv.showSuccess("Your password has been reset.");
			setTimeout(function(){ window.location.href = '/'; }, 3000);
		},
		error : function(){
            console.log("e>>>");
			rv.showAlert("I'm sorry something went wrong, please try again.");
		}
	});

	$('#set-password').modal('show');
	$('#set-password').on('shown', function(){ $('#pass-tf').focus(); })

});