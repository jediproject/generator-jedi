# [generator-jedi](https://github.com/jediproject/generator-jedi)

O objetivo deste gerador é trazer maior facilidade na criação de projetos AngularJs, seguindo a [Arquitetura de Referência AngularJs](http://jediproject.github.io).

O gerador é composto por um rotina de geração principal, que gera toda estruturação v0 de um projeto, e sub geradores para criação de controllers, modais, módulos e funcionalidades.

A rotina de geração principal é uma composição de várias ferramentas e frameworks de mercado e alguns componentes criados no Jedi Project.

O projeto v0 criado pelo gerador vem com toda configuração do npm, bower, grunt, mocks e testes (karma + protractor).

As rotinas grunt são destinada para execução de build do projeto, com opções de build para ambiente "develop", "release" e "master". Segue abaixo as tasks que cada opção de build realiza:

- **develop**: responsável por gerar a versão da aplicação para execução local, copiando todos os componentes baixados pelo bower e configurados no arquivo assetsfiles.json, gerando o main.js para esta versão de build e gerando o arquivo de ambiente para cada módulo do projeto (app/MODULO/env/MODULO-env.json), deixando a aplicação pronta para inicialização local.

- **release**: responsável por gerar a versão da aplicação para execução em ambiente de testes, realizando os mesmos passos do ambiente develop, porém, copiando todo o projeto para a pasta build/ e gerando hash para cache bust de cada arquivo.

- **master**: responsável por gerar a versão da aplicação para execução em ambiente de produção, realizando os mesmos passos do ambiente release, porém, minificando os js e css da pasta build/.

As rotinas de build "release" e "master" utilizam estratégia de cache bust, adicionando aos arquivos finais o hash da versão, modificnado os apontamentos fixos em código para a versão do arquivo final e gerando o arquivo version.json com o mapeamento dos arquivos originais e as versões atuais em cache, para carregamento de scripts dinâmicos, em tempo de execução, através do mecanismo factory.getFileVersion do componente [ng-jedi-factory](https://github.com/jediproject/ng-jedi-factory).

Cada módulo, por padrão, possui um arquivo json template (app/MODULO/env/MODULO-env.tpl.json) com variáveis de ambiente e uma versão deste arquivo para cada opção de build (app/MODULO/env/MODULO-env.AMBIENTE.json), durante execução da build o template é parseado com o conteúdo do json do ambiente selecionado (app/MODULO/env/MODULO-env.json).

Para utilizar o gerador, siga os passos:

1. Instalação do gerador

	```bash
	npm install -g yo
	npm install -g generator-jedi
	```

2. Execução do gerador via browser

	- se preferir, execute a versão do gerador via browser, que possui wizards facilitados

	```bash
	jedi
	```

	- o comando acima subirá um site local com os wizards no seguinte enderço: http://localhost:8181/

3. Execução do gerador via comando

	- se preferir, execute a versão do gerador via comando, seguindo os exemplos abaixo:

3.1. Execução do gerador principal

	```bash
	yo jedi
	```

	- informe o nome do projeto, título, nome do módulo padrão, linguagem padrão e relação de componentes que deseja gerar.
	- ao final será criado um projeto v0 na raiz onde o comando for executado, já pronto para execução.
	- Para executar a aplicação utilizar o comando:

	```bash
	npm run start
	```

3.2. Execução do gerador de controller

	```bash
	yo jedi:controller
	```

	- informe o título da tela, nome do módulo, nome do submódulo e nome do controlador.
	- ao final será criado um controller e uma tela no caminho: app//[nome do módulo]//[nome do submódulo]//[nome do controlador]

3.3. Execução do gerador de modal

	```bash
	yo jedi:modal
	```

	- informe o título da modal, nome do módulo, nome do submódulo e nome do controlador.
	- ao final será criado um controller e uma tela no caminho: app//[nome do módulo]//[nome do submódulo]//[nome do controlador]

3.4. Execução do gerador de módulo

	```bash
	yo jedi:module
	```

	- informe o nome do módulo, linguagem padrão e se deve utilizar i18n
	- ao final será criado um módulo com estrutura base no caminho: app//[nome do módulo]

3.5. Execução do gerador de feature

	```bash
	yo jedi:feature
	```
    - Informe o caminho do arquivo de config.
    - Exemplo genérico do arquivo de config:
    
    
	```json
	{
		  "moduleName": "<nome do módulo>",
		  "submodule": "<nome do sub módulo (opcional)>",
		  "featureName": "<nome da funcionalidade>",
		  "featureTitle": {
		    "pt": "<título da funcionalidade em português>",
		    "en": "<título da funcionalidade em inglês>"
		  },
		  "APIAddress": "<Endereço da API>",
		  "feature": {
		    "type": "<tipo da feature:  crud|modal>",
		    "filters": [
		      {
		        "fieldName": "<Nome do campo>",
		        "fieldLabel": {
		          "pt": "<nome do campo em português>",
		          "en": "<nome do campo em inglês>"
		        },
				        "fieldType": "<text|multi-select|single-select|text-multi-value|date|date-time|password|cpf|cnpj|tel|cep|int|currency|boolean >",
		        "fieldHint": {
		          "pt": "<hint para o campo em português (opcional)>",
		          "en": "<hint para o campo em inglês (opcional)>"
		        },
		        "requiredField": true,
		        "messageRequired": {
				          "pt": "<mensagem para o campo obrigatório em português (obrigatório se required:true)>",
				          "en": "<mensagem para o campo obrigatório em inglês (obrigatório se required:true)>"
		        },
		        "maxCharacter": 10,
		        "minCharacter": 0
		      }
		    ],
		    "results": [
		      {
		        "fieldName": "<Nome do campo>",
		        "fieldLabel": {
		          "pt": "<nome do campo em português>",
		          "en": "<nome do campo em inglês>"
		        }
		      }
		    ],
		    "domains": [
		      {
		        "fieldName": "<Nome do campo>",
		        "fieldLabel": {
		          "pt": "<nome do campo em português>",
		          "en": "<nome do campo em inglês>"
		        },
				        "fieldType": "<text|multi-select|single-select|text-multi-value|date|date-time|password|cpf|cnpj|tel|cep|int|currency|boolean >",
		        "fieldHint": {
		          "pt": "<hint para o campo em português (opcional)>",
		          "en": "<hint para o campo em inglês (opcional)>"
		        },
		        "requiredField": true,
		        "messageRequired": {
		          "pt": "<mensagem para o campo obrigatório em português (obrigatório se required:true)>",
		          "en": "<mensagem para o campo obrigatório em inglês (obrigatório se required:true)>"
		        },
		        "maxCharacter": 10,
		        "minCharacter": 0,
		        "fieldEditableFor": [
		          "create",
		          "update"
		        ],
		        "visibleToTheUser": true,
		        "key": false
		      }
		    ]
		  }
	}
	```


Para adicionar uma nova dependencia ao projeto basta seguir os seguintes passos:

1. bower install

	```bash
	bower install [componente] --save
	```

2. assetsfiles.json

	- Inclusão dos arquivos para cópia a partir da pasta bower_components/ para assets/
	```json
	{
	"files": [
		{
			"src": "bower_components/[componente]/[arquivo]",
			"dest": "assets/[tipo: css|libs|img]/[componente]/[arquivo]"
		}
		...
	]}
	```

3. main.tpl.js
	- Caso seja algum javascript, é necessário adiciona-lo na configuração base do requirejs, editando o arquivo main.tpl.js.
	- Deve-se criar um alias na sessão "paths" que aponte para o arquivo na pasta assets e na sessão shim deve ser adicionado a ordem em que o arquivo deverá ser carregado pela aplicação (quais suas dependências).

	```json
	{
		"paths": {
			"[componente]": "assets/[tipo: css|libs|img]/[componente]/[arquivo].js"
			...
		},
		"shim": {
			"[componente]": ["angular"]
			...
		}
	}
	```

## Aprecie o [demo](https://github.com/jediproject/ng-jedi-demo)