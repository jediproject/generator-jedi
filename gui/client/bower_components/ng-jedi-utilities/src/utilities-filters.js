    angular.module("jedi.utilities.filters", []).filter('jdSelected', function () {
        return function (list, field) {
            if (!field) {
                field = 'selected';
            }
            return _.filter(list, function (item) { return item[field] == true });
        };
    }).filter('jdBoolToText', ['$injector', 'jedi.utilities.UtilitiesConfig', function ($injector, UtilitiesConfig) {
        var localize;
        try {
            localize = $injector.get('jedi.i18n.Localize');
        } catch (e) { }

        var yes = (localize ? localize.get(UtilitiesConfig.yesLabel) : UtilitiesConfig.yesLabel);
        var no = (localize ? localize.get(UtilitiesConfig.noLabel) : UtilitiesConfig.noLabel);

        return function (boolValue) {
            if (boolValue === true)
                return yes;
            else
                return no
        }
    }]).filter('jdTranslate', function () {
        return (function (value) {
            //arguments[0] é ignorado porque é igual ao 'value' recebido pelo parâmetro.
            //Estrutura para entendimento: 
            //-> arguments em uma posição(i) ímpar é o valor que será comparado com o 'value'
            //-> caso seja igual, retorno o texto(string) associado a esse valor, que é arguments[i + 1].
            //Exemplo:
            //arguments[1] == true e arguments[2] == 'Sim'
            for (var i = 1; i < arguments.length; i = i + 2) {
                if (arguments[i] === value) {
                    return arguments[i + 1];
                }
            }
        })
    }).filter('jdCapitalize', function () {
        return function (input) {
            return input.charAt(0).toUpperCase() + input.substr(1);
        }
    }).filter('jdReplaceSpecialChars', function () {
        var specialChars = [
            { val: "a", let: "áàãâä" },
            { val: "e", let: "éèêë" },
            { val: "i", let: "íìîï" },
            { val: "o", let: "óòõôö" },
            { val: "u", let: "úùûü" },
            { val: "c", let: "ç" },
            { val: "A", let: "ÁÀÃÂÄ" },
            { val: "E", let: "ÉÈÊË" },
            { val: "I", let: "ÍÌÎÏ" },
            { val: "O", let: "ÓÒÕÔÖ" },
            { val: "U", let: "ÚÙÛÜ" },
            { val: "C", let: "Ç" },
            { val: "", let: "?!()" }
        ];
        return function (str) {
            var $spaceSymbol = '';
            var regex;
            var returnString = str;
            for (var i = 0; i < specialChars.length; i++) {
                regex = new RegExp("[" + specialChars[i].let + "]", "g");
                returnString = returnString.replace(regex, specialChars[i].val);
                regex = null;
            }
            return returnString.replace(/\s/g, $spaceSymbol);
        }
    });
