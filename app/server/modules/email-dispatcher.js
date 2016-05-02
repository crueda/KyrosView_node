
var EM = {};
module.exports = EM;

var nodemailer = require('nodemailer');
var PropertiesReader = require('properties-reader');

var properties = PropertiesReader('./kyrosview.properties');

EM.server = require("emailjs/email").server.connect(
{
	host 	    : process.env.EMAIL_HOST || 'smtp.gmail.com',
	user 	    : process.env.EMAIL_USER || 'crueda.cron@gmail.com',
	password    : process.env.EMAIL_PASS || 'dat123456',
	//host 	    : 'smtp.deimosgroup.eu',
	//user 	    : 'no_reply.deimosgroup.eu',
	//password    : 'Astray.67',
	ssl		    : true
});

EM.dispatchResetPasswordLink = function(account, callback)
{
    console.log("-->"+account);
    console.log("-->"+account.email);
    
var generator = require('xoauth2').createXOAuth2Generator({
    user: properties.get('mail.user'),
    clientId: properties.get('mail.clientId'),
    clientSecret: properties.get('mail.clientSecret'),
    refreshToken: properties.get('mail.refreshToken'),
    accessToken: properties.get('mail.accessToken')

});

// listen for token updates
// you probably want to store these to a db
generator.on('token', function(token){
    console.log('New token for %s: %s', token.user, token.accessToken);
});


// login
var smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        xoauth2: generator
    }
});


var mailOptions = {
    to: "crueda@gmail.com",
    subject: 'Hello ', // Subject line
    text: 'Hello world ', // plaintext body
    html: '<b>Hello world </b>' // html body
};


smtpTransport.sendMail(mailOptions, function(error, info) {
  if (error) {
    console.log(error);
  } else {
    console.log('Message sent: ' + info.response);
  }
  smtpTransport.close();
});


    
// Use Smtp Protocol to send Email
    /*
var transporter = nodemailer.createTransport('smtps://crueda.cron%40gmail.com:dat123456@smtp.gmail.com');

    
// create template based sender function
var sendPwdReminder = transporter.templateSender({
    subject: 'Password reminder for {{username}}!',
    text: 'Hello, {{username}}, Your password is: {{ password }}',
    html: '<b>Hello, <strong>{{username}}</strong>, Your password is:\n<b>{{ password }}</b></p>'
}, {
    from: 'sender@example.com',
});

// use template based sender to send a message
sendPwdReminder({
    to: 'crueda@gmail.com'
}, {
    username: 'Node Mailer',
    password: '!"\'<>&some-thing'
}, function(err, info){
    if(err){
       console.log('Error:'+err);
    }else{
        console.log('Password reminder sent');
    }
});
*/
    
    

    
    /*
	EM.server.send({
		from         : process.env.EMAIL_FROM || 'Node Login <do-not-reply@gmail.com>',
		to           : account.email,
		subject      : 'Password Reset',
		text         : 'something went wrong... :(',
		attachment   : EM.composeEmail(account)
	}, callback );
    */
}

EM.composeEmail = function(o)
{
	var link = 'https://nodejs-login.herokuapp.com/reset-password?e='+o.email+'&p='+o.pass;
	var html = "<html><body>";
		html += "Hi "+o.name+",<br><br>";
		html += "Your username is <b>"+o.user+"</b><br><br>";
		html += "<a href='"+link+"'>Click here to reset your password</a><br><br>";
		html += "Cheers,<br>";
		html += "<a href='https://twitter.com/braitsch'>braitsch</a><br><br>";
		html += "</body></html>";
	return  [{data:html, alternative:true}];
}