
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
    
var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
//var transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'carlrue.cron@gmail.com',
        pass: 'passss'
    }
});

// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"Fred Foo 👥" <foo@blurdybloop.com>', // sender address
    to: 'crueda@gmail.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world 🐴', // plaintext body
    html: '<b>Hello world 🐴</b>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
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