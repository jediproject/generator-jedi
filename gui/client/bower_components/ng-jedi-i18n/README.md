# ng-jedi-i18n
[i18n](https://docs.angularjs.org/guide/i18n) component.
###### Written in [AngularJs](https://angularjs.org/)

  1. [Install](#install)
  1. [How To Use](#how-to-use)

### Install

* Install the dependency:

   ```shell
   bower install ng-jedi-i18n --save
   ```
* Add i18n.js to your code:

   ```html
   <script src='assets/libs/ng-jedi-i18n/i18n.js'></script>
   ```
   - Note that the base directory used was assets/libs, you should change bower_components to assets/libs or move from bower_components to assets/libs with [Grunt](http://gruntjs.com/).
* Include module dependency:

   ```javascript
   angular.module('yourApp', ['jedi.i18n']);
   ```

* Requirements:

   - This component uses [angular-dynamic-locale](https://github.com/lgalfaso/angular-dynamic-locale) to correctly load the [$locale](https://docs.angularjs.org/api/ng/service/$locale) after [bootstrap](http://getbootstrap.com).

======

### How To Use

  1. [Configuration](#configuring-the-default-language-supported-languages-and-angular-locale-path)
  1. [Resources](#add-resources-bundle)
  1. [Language](#get-and-change-language)
  1. [Translate](#translate)  

#### Configuring the default language, supported languages and angular locale path
 ```javascript
 app.config(['jedi.i18n.LocalizeConfig', function(LocalizeConfig){
   LocalizeConfig.defaultLanguage = 'en'; // default is en
   LocalizeConfig.supportedLanguage = ['en', 'pt']; // detault is en and pt
   LocalizeConfig.localePath = 'assets/libs/angular-i18n/angular-locale_{{locale}}.js'; // this is the default value
 }]);
 ```

#### Add resources bundle
 ```javascript
 app.run(['jedi.i18n.Localize', function(Localize){
   Localize.addResource('app/common/i18n/resources_{lang}.json'); // the lang will be replaced with the chosen language
 }]);
 ```
* The resources file should be in the format below:

 ```json
  {
    "resources": {
      "back": "Voltar",
      "enter": "Entrar",
      "name": "Nome",
      "save": "Salvar",
      "password": "Senha",
      "user": "Usuário",
      "press to save": "Pressione para salvar",
      "press button below to save": "Pressione o botão abaixo para salvar"
    },
    "regexResources": {
      "Would you like to add the product (\w+) to your cart?": "Gostaria de adicionar o produto $1 em seu carrinho de compras?"
    }
  }
 ```
  - The keys in resources should be in lower case
  - The regexResources should be used to store dynamic keys and the resources to store static keys


#### Get and change language

 ```javascript
 app.controller(['jedi.i18n.Localize', function(Localize){
   ...
   var lang = Localize.getLanguage();
   ...
   Localize.setLanguage('pt');
   ...
 }]);
 ```

   - If [moment.js](http://momentjs.com/) component is used the method setLanguage will change its locale
   - If you use angular filters, like date and currency, the $locale will be changed and the format will work

#### Translate
```javascript
app.controller(['jedi.i18n.Localize', function(Localize){
  ...
  Localize.setLanguage('pt');
  ...
  alert(Localize.get('Would you like to add the product iPad in your cart?')); // it will be displayed "Gostaria de adicionar o produto iPad em seu carrinho de compras?"
  ...
}]);
```

```html
 Like a tag:
 
 <span><jd-i18n>press button below to save</jd-i18n></span>
 
 Or like a attribute:
 
 <button title="Press to save" jd-i18n>Save</button>
 
 if language equal 'pt' will be displayed:
 <button title="Pressione para salvar">Salvar</button>
 
 Or like a filter:
 
 <td>{{value | jdI18n}}</td>
```
   - This component replace attributes alt, title, placeholder and text body

**[Back to top](#how-to-use)**
