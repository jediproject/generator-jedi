# Angular File Upload

A versão original pode ser encontrada em: https://github.com/nervgh/angular-file-upload

---

## Sobre

**Angular File Upload** é um módulo para o framework [AngularJS](http://angularjs.org/). Suporta upload arrastando e soltando os arquivos, barra de progresso, filtros de validação e uma fila de arquivos para upload. Suporta uploads em HTML5 nativo, mas para navegadores mais antigos o mecanismo utiliza o método legado iframe de upload. Funciona em qualquer plataforma server-side que suporta padrões de HTML form para upload. 

Quando os arquivos são selecionado ou arrastados (drag-n-drop) para o componente, um ou mais filtros são aplicados. Os arquivos que forem válidos para os filtros são adicionados à fila. Para cada um destes que foram adicionados na fila é criado uma instância de `{FileItem}` e as configurações do uploader são copiadas para este objeto. Por fim, os itens adicionados na fila (FileItems) estão prontos para o upload.

## Mudanças da versão 'interceptor'
Agora o mecanismo dá suporte para interceptors do AngularJs, através do $httpProvider, para que sua aplicação possa manipular as requisições de upload da forma que preferir.

Você pode encontrar este módulo no bower pelo nome: [angular-file-upload-interceptor] ou pelo link: (http://bower.io/search/?q=angular-file-upload-interceptor)

## Demos
1. [Simple example](http://nervgh.github.io/pages/angular-file-upload/examples/simple)
2. [Uploads only images (with canvas preview)](http://nervgh.github.io/pages/angular-file-upload/examples/image-preview)
3. [Without bootstrap example](http://nervgh.github.io/pages/angular-file-upload/examples/without-bootstrap)

## More Info

1. [Introduction](https://github.com/nervgh/angular-file-upload/wiki/Introduction)
2. [Module API](https://github.com/nervgh/angular-file-upload/wiki/Module-API)
3. [FAQ](https://github.com/nervgh/angular-file-upload/wiki/FAQ)
4. [Migrate from 0.x.x to 1.x.x](https://github.com/nervgh/angular-file-upload/wiki/Migrate-from-0.x.x-to-1.x.x)
5. [RubyGem](https://github.com/marthyn/angularjs-file-upload-rails)
