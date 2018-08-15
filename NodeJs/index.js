//https://github.com/wcustodio/pagseguro-node
//https://devs.pagseguro.uol.com.br/docs/checkout-web-usando-a-sua-tela#listagem-parametros
var PagSeguro = require('node-pagseguro');

//Referencia: https://stackoverflow.com/questions/6912584/how-to-get-get-query-string-variables-in-express-js-on-node-js
//Para testar digite no nagegador:
//http://localhost:3000/?function=sessionId&outrosArgumentosAqui=blablabla
var express = require('express');
var app = express();

var payment = new PagSeguro({
   email: 'xxx.yyy.zzz@gmail.com',
   token: 'jksahbdkjsbcjsbcnknxkznasjnxajdxn',
   currency: 'BRL' //opcional - default BRL
});






//app.post('/', function(req, res){
app.get('/', function(req, res){
	//res.send({test:"xxx"});
	console.log("Recived: ", req.query)
	if(req.query.function == "sessionId"){
		//Obter ID de Sessão
		payment.sessionId(function(err, session_id) {
			res.send({result:"ok", sessionId:session_id});
			console.log("123: ", session_id)
		});
		console.log("Função 'sessionId' identificada com sucesso!");
	}
	else if(req.query.function == "makeTransaction"){
		//res.send({result:"ok"});
		objRecived = JSON.parse(req.query.argsObject);
		if(objRecived){
			console.log("Função 'makeTransaction' identificada com sucesso! Objecto de argumentos recebido: ", objRecived);
			
			//------------------------------- makeTransaction -------------------------------
			
			//Dados do Comprador (Sender)
			payment.setSender(objRecived.paymentData.setSender);

			//Dados do Proprietário do Cartão de Crédito (CreditCardHolder)
			payment.setCreditCardHolder(objRecived.paymentData.setCreditCardHolder);

			//Dados do Endereço de Entrega (Shipping)
			payment.setShipping(objRecived.paymentData.setShipping);

			//Dados do Endereço de Cobrança (Billing)
			payment.setBilling(objRecived.paymentData.setBilling);
			
			items = objRecived.paymentData.setItems;
			
			let totalValue = 0.00;
			items.forEach(function(item, index){
				console.log(item);
				totalValue = totalValue + (item.qtde*item.value);
				payment.addItem({
				   qtde: item.qtde,
				   value: item.value,
				   description: item.description
				});
			})

			//Obter ID de Sessão
			//payment.sessionId(function(err, session_id) {
			//
			//});

			//Enviar Transação
			payment.sendTransaction({
			   method: "creditCard", //'boleto' ou 'creditCard'
			   credit_card_token: objRecived.creditCardToken,//"ZDFVDSVCVFRDVDCVSVDVSAFDCDV",
			   value: totalValue,//0.30,
			   installments: 1, //opcional, padrão 1
			   hash: objRecived.senderHashID//"wdsadxadsASDACDSCSDADVDGFDGFGFGVFVFDV" //senderHash gerado pela biblioteca do PagSeguro
			}, function(err, data) {
				console.log("1: ", err);
				console.log("2: ", data);
				if(err == false){
					//Sucessoooo!!
					res.send({result:"ok"});
					console.log("Sucessoooo!");
				}else{res.send({result:"nok"});console.log("Errooou!");}
			});
			
			//------------------------------- makeTransaction -------------------------------
			
		}else{res.send({result:"nok"});console.log("Argumentos incorretos!")}
		
	}
	else{res.send({result:"nok"});console.log("Função desconhecida!")}
});

app.listen(3000);

