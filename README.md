# [generator-jedi](https://github.com/jediproject/generator-jedi)

The main purpose of this generator is providing an easy way to create AngularJs projects, following this [AngularJs Reference Architecture](http://jediproject.github.io). 

It has the main routine where it builds all the v0 ("version zero") structure of a project and sub routines to build controllers, modals, modules and features.

The v0 generating routine uses a set of tools and frameworks well consolidated and some Jedi Project Components.

Inside the v0 generated project it has already configured: npm, bower, gulp, mocks e tests (karma + protractor).

1. [Generated Gulp tasks](#generated-gulp-tasks)
2. [Cache Busting](#cache-busting)
3. [Environment Files](#environment-files)
4. [Using the Generator](#using-the-generator)
  1. [Installing](#installing)
  2. [Executing it on a web browser](#executing-it-on-a-web-browser)
  3. [Executing it on command line](#executing-it-on-command-line)
  4. [Adding new Dependencies](#adding-new-dependencies)

### Generated Gulp tasks

The gulp tasks are meant to execute the build process of the project, having options to build targeting "develop", "release" and "master" environments. The tasks that each build option execute:

- **develop**: meant to run locally, it copies all bower components that are listed in **assetsfiles.json** and generates the environment file to each module of the project (*app/[module]/env/[module]-env.json*).

- **release**: meant to run on a testing environment, executes all the tasks of develop plus it copies all the files to the *build/* folder e generates a hash of each file to be used as cache bust.

- **master**: meant to run on production environment, executes all the tasks of release plus it minifies every js and css file on the build folder.

### Cache Busting

The *release* and *master* build routines run a cache busting task. It adds to each file a hash on its name, and updates every fixed reference to those files so they point to the right version. After that it creates the file **version.json** that maps every original filename and their "hashed" version, so it's possible to load dynamic scripts while running the application using the *factory.getFileVersion* method from the [ng-jedi-factory](https://github.com/jediproject/ng-jedi-factory) component.

### Environment files

Eache module has a json file template (*app/[module]/env/[module]-env.tpl.json*) with the environment variables or settings for the module, and a version of this file for each build environment (*app/[module]/env/[module]-env.[environment].json*) that should contain the right values for that environment. During build process the template is parsed and the final file *[module]-env.json* is created having the values equals to the values on the corresponding environment file. 

### Using the generator

To use the generator just follow these steps:

#### Installing

```bash
npm install -g yo
npm install -g generator-jedi
```

#### Executing it on a web browser

You can execute the generator on your browser and follow it's easy to use wizards:

```bash
jedi
```

- This command will run a local site with all the wizards in http://localhost:5000/

#### Executing it on command line

You can follow the examples below:

1. The main generator:
    ```bash
        yo jedi
    ```

    * Inform project title, name, main module name, standard language and components
    * This will create a v0 application on the folder where the command was executed. The application is ready to run.
    * You can start it with:
        ```bash
            npm run start
        ```

1. Controller generator
    ```bash
        yo jedi:controller
    ```

    * You will be asked the page title, module name, submodule name and controller name.
    * By the end the controller will be created at the path: *app/[module name]/[submodule name]/[controller name]*.
    
1. Modal generator
    ```bash
        yo jedi:modal
    ```

    * Needs modal title, module name, submodule name and controller name
    * By the end the controller will be created at the path: *app/[module name]/[submodule name]/[controller name]*.
    
1. Module generator
    ```bash
        yo jedi:module
    ```

    * Inform module name, default language and if it should use i18n.
    * You will have a module structure at : *app/[module name]*.
    
1. Feature generator
    ```bash
        yo jedi:feature
    ```

    * Inform the config file path:
        * Config file example:
        
            ```json
            {
                    "moduleName": "<name module>",
                    "submodule": "<name submodule (optional)>",
                    "featureName": "<name da feature>",
                    "featureTitle": {
                    "pt": "<título feature in portuguese>",
                    "en": "<título feature in english>"
                    },
                    "APIAddress": "<API address>",
                    "feature": {
                    "type": "<feature type:  crud|modal>",
                    "filters": [
                        {
                        "fieldName": "<Field Name>",
                        "fieldLabel": {
                            "pt": "<Field Name in portuguese>",
                            "en": "<Field Name in english>"
                        },
                                "fieldType": "<text|multi-select|single-select|text-multi-value|date|date-time|password|cpf|cnpj|tel|cep|int|currency|boolean >",
                        "fieldHint": {
                            "pt": "<hint in portuguese (optional)>",
                            "en": "<hint in english (optional)>"
                        },
                        "requiredField": true,
                        "messageRequired": {
                                    "pt": "<message for required field in portuguese (mandatory if required:true)>",
                                    "en": "<message for required field in english (mandatory if required:true)>"
                        },
                        "maxCharacter": 10,
                        "minCharacter": 0
                        }
                    ],
                    "results": [
                        {
                        "fieldName": "<Name>",
                        "fieldLabel": {
                            "pt": "<name in portuguese>",
                            "en": "<name in english>"
                        }
                        }
                    ],
                    "domains": [
                        {
                        "fieldName": "<Name>",
                        "fieldLabel": {
                            "pt": "<name in portuguese>",
                            "en": "<name in english>"
                        },
                                "fieldType": "<text|multi-select|single-select|text-multi-value|date|date-time|password|cpf|cnpj|tel|cep|int|currency|boolean >",
                        "fieldHint": {
                            "pt": "<hint in portuguese (optional)>",
                            "en": "<hint in english (optional)>"
                        },
                        "requiredField": true,
                        "messageRequired": {
                            "pt": "<message for required field in portuguese (mandatory if required:true)>",
                            "en": "<message for required field in english (mandatory if required:true)>"
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

#### Adding new Dependencies

To add a new dependency in the project you need to do the following:

1. bower install

```bash
bower install [component] --save
```

2. change **assetsfiles.json**

    - Include the files to be copied from bower_components/ to assets/
```json
{
    "libs": {
        "dest": "assets/libs/",
        "src": [
            "bower_components/[component-foo]/[foo.js]",
            "bower_components/[component-bar]/[bar.js]"
        ]
    }
}
```

3. change **main.js**
    - If there is a js file you'll need to add it on the requirejs base configuration by editing the **main.js** file.
    - You should create an alias on the "*paths*" section and point it to the corresponding js file in the assets folder. And in the section named "*shim*" you must set its dependencies.

```json
{
    "paths": {
        "[component]": "assets/[type: css|libs|img]/[component]/[file].js"
        ...
    },
    "shim": {
        "[component]": ["angular"]
        ...
    }
}
```

#### [Check out our demo!](https://github.com/jediproject/ng-jedi-demo)