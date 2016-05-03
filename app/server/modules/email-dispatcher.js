
var EM = {};
module.exports = EM;

var nodemailer = require('nodemailer');
var PropertiesReader = require('properties-reader');

var properties = PropertiesReader('./kyrosview.properties');

EM.dispatchResetPasswordLink = function(account, callback)
{
    console.log("-->"+account);
    console.log("-->"+account.email);
    console.log("-->"+properties.get('mail.user'));
    console.log("-->"+EM.composeEmail(account));
    
var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
//var transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: properties.get('mail.user'),
        pass: properties.get('mail.pass')
    }
});

// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"Kyros LBS" <foo@kyroslbs.com>', // sender address
    to: account.email, // list of receivers
    subject: 'KyrosView password reset', // Subject line
    text: 'something went wrong... :(', // plaintext body
    html: EM.composeEmail(account)
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
    
}

EM.composeEmail = function(o)
{
	var link = 'http://localhost:3000/reset-password?e='+o.email+'&p='+o.pass;
	var html = "<html><body>";
		html += "Hi "+o.name+",<br><br>";
		html += "Your username is <b>"+o.user+"</b><br><br>";
		html += "<a href='"+link+"'>Click here to reset your password</a><br><br>";
		html += "Cheers,<br>";
		html += "<a href='http://www.kyroslbs.com'>Kyros LBS Team</a><br><br>";
		html += "</body></html>";
	//return  [{data:html, alternative:true}];
	return  html;
}