const {models} = require('./model');
const {log, biglog, errorlog, colorize} = require("./out");

/**
 *  Muestra la ayuda.
 *
 *  @param rl Objeto readline usado para implementar el CLI
 */
exports.helpCmd = rl => {
    log("Comandos:");
    log("   h|help - Muestra esta ayuda.");
    log("   list - Listar los quizzes existentes.");
    log("   show <id> - Muestra la pregunta y la respuesta del quiz indicado.");
    log("   add - Añadir un nuevo quiz interactivamente.");
    log("   delete <id> - Borrar el quiz indicado.");
    log("   edit <id> - Editar el quiz indicado.");
    log("   test <id> - Probar el quiz indicado.");
    log("   p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log("   credits - Créditos.");
    log("   q|quiz - Salir del programa.");
    rl.prompt();
};

/**
 *  Lista todos los quizzes existentes en el modelo.
 *
 *  @param rl Objeto readline usado para implementar el CLI
 */
exports.listCmd = rl => {

    models.quiz.findAll()
        .then(quizzes => {
            quizzes.forEach((quiz) => {
                log(`   [${colorize(id,'magenta')}]: ${quiz.question}`);
            });
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });

};

/**
 *  Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
 *
 *  @param id Clave del quiz a mostrar
 *  @param rl Objeto readline usado para implementar el CLI
 */
exports.showCmd = (rl,id) => {

    if(typeof id === "undefined") {
        errorlog(`Falta el parametro id.`);
    } else {
        try {
            const quiz = model.getByIndex(id);
            log(`   [${colorize(id, 'magenta')}]:   ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);

        } catch (error) {
            errorlog(error.message);
        }
    }

    //log('Mostrar el quiz indicado.');
    rl.prompt();
};

/**
 *  Añade un nuevo quiz al modelo.
 *  Pregunta interactivamente por la pregunta y la respuesta.
 *
 *  @param rl Objeto readline usado para implementar el CLI
 */
exports.addCmd = rl => {

    rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
        rl.question(colorize(' Introduzca la respuesta: ','red'), answer => {
            model.add(question,answer);
            log(` ${colorize('Se ha añadido','magenta')}: ${question} ${colorize('=>','magenta')} ${answer}`);
            rl.prompt();
        });
    });

    //log('Añadir un nuevo quiz.');
};

/**
 *  Borrar un quiz del modelo.
 *
 *  @param id Clave del quiz a borrar en el modelo
 *  @param rl Objeto readline usado para implementar el CLI
 */
exports.deleteCmd = (rl,id) => {

    if(typeof id === "undefined") {
        errorlog(`Falta el parametro id.`);
    } else {
        try {
            model.deleteByIndex(id);
        } catch (error) {
            errorlog(error.message);
        }
    }

    //log('Borrar el quiz indicado.');
    rl.prompt();
};

/**
 *  Edita un quiz del modelo.
 *
 *  @param id Clave del quiz a editar
 *  @param rl Objeto readline usado para implementar el CLI
 */
exports.editCmd = (rl,id) => {

    if(typeof id === "undefined") {
        errorlog(`Falta el parametro id.`);
        rl.prompt();
    } else {
        try {
            const quiz = model.getByIndex(id);
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
                rl.question(colorize(' Introduzca la respuesta: ','red'), answer => {
                    model.update(id,question,answer);
                    log(` Se ha cambiado el quiz ${colorize(id,'magenta')} por: ${question} ${colorize('=>','magenta')} ${answer}`);
                    rl.prompt();
                });
            });
        } catch (error) {
            errorlog(error.message);
            rl.prompt();
        }
    }

    //log('Editar el quiz indicado.');
    rl.prompt();
};

/**
 *  Prueba un quiz.
 *  Hace una pregunta del modelo a la que debemos contestar.
 *
 *  @param id Clave del quiz a mostrar
 *  @param rl Objeto readline usado para implementar el CLI
 */
exports.testCmd = (rl,id) => {

    if(typeof id === "undefined") {
        errorlog(`Falta el parametro id.`);
        rl.prompt();
    } else {
        try {
            const quiz = model.getByIndex(id);

            rl.question(colorize('¿'+ quiz.question + '? ','red'),resp => {
                if(resp.toLowerCase().trim() === quiz.answer.toLowerCase()) {
                    log("Correcto",'green');
                    rl.prompt();
                } else {
                    log("Incorrecto",'red');
                    rl.prompt();
                }
            });

        } catch (error) {
            errorlog(error.message);
            rl.prompt();
        }
    };
};

/**
 *  Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
 *  Se gana si se contesta a todos correctamente.
 *
 *  @param rl Objeto readline usado para implementar el CLI
 */
exports.playCmd = rl => {
    let score = 0;
    let toBeResolved = [];
    let ordenArray = 0;

    for(let i=0; i < quizzes.length; i++) {
        toBeResolved[i]=quizzes[i];
        log(toBeResolved[i],'blue');
    }

    const playOne = () => {
        if(toBeResolved.length === 0) {
            log('¡No hay preguntas que responder!','red');
            log('Fin del examen. Aciertos: ');
            biglog(score,'red');
            rl.prompt();

        } else {
            //let quiz = toBeResolved.splice(Math.floor(Math.random() * (3)));

            let id = Math.floor(Math.random() * toBeResolved.length);

            let quiz = toBeResolved[id];
            //log(quiz);

            rl.question(colorize('¿'+ quiz.question + '? ','red'),resp => {
                if(resp.toLowerCase() === quiz.answer.toLowerCase()) {
                    score++;
                    log('CORRECTO - Lleva ' + score + ' aciertos');
                    toBeResolved.splice(id,1);
                    //log(toBeResolved);
                    playOne();
                } else {
                    log('INCORRECTO.');
                    log('Fin del examen. Aciertos:')
                    biglog(score,'red');
                    rl.prompt();
                }
            });
        }
    };

    playOne();

};

/*const arrayAleatorio = () => {
    var cantidadNumeros = 5;
    var myArray = []
    while(myArray.length < cantidadNumeros ){
        var numeroAleatorio = Math.ceil(Math.random()*cantidadNumeros);
        var existe = false;
        for(var i=0;i<myArray.length;i++){
            if(myArray [i] == numeroAleatorio){
                existe = true;
                break;
            }
        }
        if(!existe){
            myArray[myArray.length] = numeroAleatorio;
        }
    }
    document.write("números aleatorios : " + myArray);
};*/

/**
 *  Muestra el nombre del autor de la prática.
 *
 *  @param rl Objeto readline usado para implementar el CLI
 */
exports.creditsCmd = rl => {
    log('Autor de la práctica:');
    log('ALBERTO');
    rl.prompt();
};


/**
 *  Termina la ejecución.
 */
exports.quitCmd = rl => {
    rl.close();
    rl.prompt();
};