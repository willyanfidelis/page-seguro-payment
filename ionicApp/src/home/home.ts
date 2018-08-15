import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Http, Response, Headers } from '@angular/http';
import { URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
declare let PagSeguroDirectPayment: any; //https://devs.pagseguro.uol.com.br/docs/checkout-web-usando-a-sua-tela#listagem-parametros

export interface  SetSenderModel{
  name: string,//"FirstName SecondName",
  email: string,//"xyz@hotmail.com",
  cpf_cnpj: string,//"05588899905",
  area_code: string,//"47",
  phone: string,//"988887777",
  birth_date: string,//"15/10/1990" //formato dd/mm/yyyy
}

export interface  SetCreditCardHolderModel{
  name: string,//"FirstName SecondName",
  cpf_cnpj: string,//"05588899905",
  area_code: string,//"47",
  phone: string,//"988887777",
  birth_date: string,//"15/10/1990" //formato dd/mm/yyyy
}

export interface  SetShippingModel{
  street: string,//"Lages",
  number: string,//"111",
  district: string,//"Centro",
  city: string,//"Joinville",
  state: string,//"SC",
  postal_code: string,//"89201205",
  same_for_billing: boolean// //opcional, informar se o endereço de entrega for o mesmo do endereço de cobrança
}

export interface  SetBillingModel{
  street: string,//"Lages",
  number: string,//"111",
  district: string,//"Centro",
  city: string,//"Joinville",
  state: string,//"SC",
  postal_code: string//"89210250",
}

export interface  SetItemsModel{
  qtde: number,//1,
  value: number,//0.10,
  description: string//"Coca"
}

export interface  GetCreditCardTokenModel{ //Este é o unico dado que não é utilizado no lado do servidor, apesar de esse dado ser enviado mesmo assim!
  cardNumber: string,//"1111222233334444",
  brand: string,//"mastercard",
  cvv: string,//"123",
  expirationMonth: string,//"10",
  expirationYear: string//"2025",
}

export interface  MakeAllPaymentTransactionModel{
  setSender: SetSenderModel,
  setCreditCardHolder: SetCreditCardHolderModel,
  setShipping: SetShippingModel,
  setBilling: SetBillingModel,
  setItems: Array<SetItemsModel>,
  getCreditCardToken: GetCreditCardTokenModel,
}

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public http: Http, public navCtrl: NavController) {

  }

  public makeAllPaymentTransaction(paymentData: MakeAllPaymentTransactionModel): Promise<{result:string}>{
    return new Promise(resolve => {

      this.getSessionId().then((sessID)=>{if(sessID.sessionId){
        PagSeguroDirectPayment.setSessionId(sessID.sessionId);
        this.getSenderHashID((senderHashID)=>{if(senderHashID){
          // let creditCard: GetCreditCardTokenModel = {
          //   cardNumber: "1111222233334444",
          // 	brand: "mastercard",
          // 	cvv: "123",
          // 	expirationMonth: "10",
          // 	expirationYear: "2025"
          // }
          this.getCreditCardToken(paymentData.getCreditCardToken,(cardToken)=>{if(cardToken){
            //console.log("SenderHashID: ", senderHashID, "CardToken: ", cardToken)
            this.makePayment(senderHashID,cardToken, paymentData).then((res)=>{if(res.result=="ok"){console.log("Compra realizada com sucesso!");resolve({result:"ok"});}else{/*ERROR Place!*/resolve({result:"nok"});}});;
          }else{/*ERROR Place!*/resolve({result:"nok"});}});
        }else{/*ERROR Place!*/resolve({result:"nok"});}})
      }else{/*ERROR Place!*/resolve({result:"nok"});}});

    });
  }

  public getSessionId(): Promise<{result:string,sessionId?: string}>{
    //let params: "";
    //let headers: any;

    return new Promise(resolve => {
      //this.http.get(  'http://localhost:3000/?function=sessionId&outrosArgumentosAqui=blablabla').map((res: Response) => res/*.json()*/)
      let toSend: any = JSON.stringify({function:"sessionId"})
      this.http.post(  'https://us-central1-market-3f9b6.cloudfunctions.net/helloWorld', toSend).map((res: Response) => res/*.json()*/)
        .subscribe(data => {
          console.log("XXX: ", data.json())
          resolve(data.json());
        },  err => {
          resolve(/*JSON.parse(err._body)*/{result:"nok"});//console.log(err._body)
            console.log("Erro: getSessionId")
          });

    });
  }

  public getSenderHashID(cb : (hash: string | null) => void): void{
    PagSeguroDirectPayment.onSenderHashReady(function(response){
      if(response.status == 'error') {
          console.log(response.message);
          cb(null);
      }
      else{
        console.log("Done: ", response.senderHash);
        cb(response.senderHash);
      }
      //var hash = response.senderHash; //Hash estará disponível nesta variável.
    });
  }


  public getCreditCardToken(creditCard: GetCreditCardTokenModel, cb : (token: string | null) => void){
    PagSeguroDirectPayment.createCardToken({
  	cardNumber: creditCard.cardNumber,
  	brand: creditCard.brand,
  	cvv: creditCard.cvv,
  	expirationMonth: creditCard.expirationMonth,
  	expirationYear: creditCard.expirationYear,
  	success: function(response){cb(response.card.token); console.log("success!!!", response)},
  	error: function(response){cb(null); console.log("error!!!", response)},
  	complete: function(response){console.log("complete!!!")}
  });
  }

  public makePayment(senderHashID: string, creditCardToken: string, paymentData: MakeAllPaymentTransactionModel): Promise<{result:string}>{
    let obj: any = {senderHashID:senderHashID,creditCardToken:creditCardToken, paymentData:paymentData};

    return new Promise(resolve => {
      //this.http.get(  'http://localhost:3000/?function=makeTransaction&argsObject='+JSON.stringify(obj)).map((res: Response) => res/*.json()*/)
      let toSend: any = JSON.stringify({function:"makeTransaction",argsObject:JSON.stringify(obj)})
      this.http.post(  'https://us-central1-market-3f9b6.cloudfunctions.net/helloWorld', toSend).map((res: Response) => res/*.json()*/)
        .subscribe(data => {
          resolve(data.json());
        },  err => {
          resolve(/*JSON.parse(err._body)*/{result:"nok"});//console.log(err._body)
            console.log("Erro: makePayment")
          });

    });
  }


  public makeAll(){
    let payment: MakeAllPaymentTransactionModel = {
      setSender: {
        name: "FirstName SecondName",
        email: "xyz@hotmail.com",
        cpf_cnpj: "05577799905",
        area_code: "47",
        phone: "988885555",
        birth_date: "25/10/1990"
      },
      setCreditCardHolder: {
        name: "Willyan Fidelis",
        cpf_cnpj: "05577799905",
        area_code: "47",
        phone: "988885555",
        birth_date: "25/10/1990"
      },
      setShipping: {
        street: "Lages",
        number: "111",
        district: "Centro",
        city: "Joinville",
        state: "SC",
        postal_code: "89210250",
        same_for_billing: true
      },
      setBilling: {
        street: "Lages",
        number: "111",
        district: "Centro",
        city: "Joinville",
        state: "SC",
        postal_code: "89210250",
      },
      setItems: [{qtde: 2, value: 0.15, description: "Bala"}, {qtde: 1, value: 0.10, description: "Chocolate"}],
      getCreditCardToken: {
        cardNumber: "1111222233334444",
        brand: "mastercard",
        cvv: "123",
        expirationMonth: "10",
        expirationYear: "2025"
      }
    }
    this.makeAllPaymentTransaction(payment).then((res)=>{if(res.result=="ok"){console.log("Tudo OK!");}else{console.log("Nada OK!");}})
  }

  public test(){
    //https://itnext.io/working-with-firebase-functions-http-request-22fd1ab644d3
    //let data: any = {x:55,y:"abc",z:{data1:"a",data2:"b"}};
    //let toSend: string = JSON.stringify(data);
    let toSend = JSON.stringify({function:"sessionId"})
    return new Promise(resolve => {
      //this.http.get(  'https://us-central1-market-3f9b6.cloudfunctions.net/helloWorld/?function=sessionId&outrosArgumentosAqui=blablabla').map((res: Response) => res/*.json()*/)
      this.http.post(  'https://us-central1-market-3f9b6.cloudfunctions.net/helloWorld', toSend).map((res: Response) => res/*.json()*/)
        .subscribe(data => {

          console.log("XXX: ", data)
          //console.log("XXX: ", data.json())
          resolve(data);
        },  err => {
          resolve(/*JSON.parse(err._body)*/{result:"nok"});//console.log(err._body)
            //this.prob = err;
          });

    });
  }
}
