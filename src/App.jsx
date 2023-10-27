import React, { useState, useEffect } from 'react';
import './index.css'
import axios from 'axios';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils/index.js';
import { saveAs } from 'file-saver';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';


function loadFile(url, callback) {
  PizZipUtils.getBinaryContent(url, callback);
}

export const App = () => {
  const [mainTopic, setMainTopic] = useState('')
  const [intro, setIntro] = useState('');
  const [generatedIntro, setGeneratedIntro] = useState('')
  const [exercises, setExercises] = useState('');
  const [generatedExercises, setGeneratedExercises] = useState('')
  const [questions, setQuestions] = useState('')
  const [generatedQuestions, setGeneratedQuestions] = useState('')
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  
  
  
  const generateDocument = (event) => {

    loadFile(
      'src/Membrete.docx',
      function (error, content) {
        if (error) {
          throw error;
        }
        var zip = new PizZip(content);
        var doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        });
        doc.setData({
          mainTopic: `${mainTopic}`,
          intro: `${intro}`,
          generatedIntro: `${generatedIntro}`,
          generatedExercises: `${generatedExercises}`,
          generatedQuestions: `${generatedQuestions}`
        });
        try {
          // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
          doc.render();
        } catch (error) {
          // The error thrown here contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
          function replaceErrors(apiKey, value) {
            if (value instanceof Error) {
              return Object.getOwnPropertyNames(value).reduce(function (
                error,
                apiKey
              ) {
                error[apiKey] = value[apiKey];
                return error;
              },
                {});
            }
            return value;
          }
          console.log(JSON.stringify({ error: error }, replaceErrors));

          if (error.properties && error.properties.errors instanceof Array) {
            const errorMessages = error.properties.errors
              .map(function (error) {
                return error.properties.explanation;
              })
              .join('\n');
            console.log('errorMessages', errorMessages);
            // errorMessages is a humanly readable message looking like this :
            // 'The tag beginning with "foobar" is unopened'
          }
          throw error;
        }
        var out = doc.getZip().generate({
          type: 'blob',
          mimeType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }); //Output the document using Data-URI
        saveAs(out, `${mainTopic}.docx`);
      }
    );
  };

  const generateIntro = async () => {
    try {
      const response = await axios.post('https://api.openai.com/v1/engines/text-davinci-003/completions', {
        prompt: `Generame una ${intro} del tema ${mainTopic} en contexto de programacion, facil para la lectura de 300 palabras y para un documento word`,
        max_tokens: 3000, // Número máximo de tokens en la respuesta generada
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const generatedIntro = response.data.choices[0].text;
      setGeneratedIntro(generatedIntro);
    } catch (error) {
      console.error('Error al generar el contenido:', error);
    }
  };

  const generateExercises = async () => {
    try {
      const response = await axios.post('https://api.openai.com/v1/engines/text-davinci-003/completions', {
        prompt: `Generame ${exercises} ejercicios practicos del tema ${mainTopic}, facil para la lectura y para un formato word, solo necesito los ejercicios`,
        max_tokens: 3000, // Número máximo de tokens en la respuesta generada
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const generatedExercises = response.data.choices[0].text;
      setGeneratedExercises(generatedExercises);
    } catch (error) {
      console.error('Error al generar el contenido:', error);
    }
  };

  const generateQuestions = async () => {
    try {
      const response = await axios.post('https://api.openai.com/v1/engines/text-davinci-003/completions', {
        prompt: `Necesito una bateria de preguntas que contenga un total de ${questions} del tema ${mainTopic}, necesito que las preguntas sean variadas,
            por ejemplo preguntas de opcion multiple, respuesta directa o verdadero o falso, respondeme solo con las preguntas`,
        max_tokens: 3000, // Número máximo de tokens en la respuesta generada
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const generatedQuestions = response.data.choices[0].text;
      setGeneratedQuestions(generatedQuestions);
    } catch (error) {
      console.error('Error al generar el contenido:', error);
    }
  };

  const handleGenerate = async () => {
    await generateIntro();
    await new Promise((resolve) => setTimeout(resolve, 10000))
    await generateExercises();
    await new Promise((resolve) => setTimeout(resolve, 10000))
    await generateQuestions()
    await new Promise((resolve) => setTimeout(resolve, 10000))
  }



  return (
    <>

      {/* Banner inicial */}

      <div id="banner">
        <p className="bn_t1">¡ENTRENA CON NOSOTROS!</p>
        <p className="bn_t2"><a href="#">Aplicar aquí</a> y haz realidad tu sueño de ser el Techie o Digital Marketer que has
          soñado.</p>
      </div>

      {/* Navbar Level Up */}
      <section id="menu">
        <a className="logo" href="#">
          <img src="https://levelup.gt/img/logo_negativo.png" />
        </a>
        <section id="nav">
          <a href="#" className="button active">Programas</a>
          <a href="#" className="button">Ser mentor</a>
          <a href="#" className="button">¿Por qué level up?</a>
          <a href="#" className="button">Contacto</a>
          <a href="#" className="button hot">Aplicar</a>
        </section>
      </section>


      {/* Formulario */}



      <div className="container text-center">
        <br />
        <header> <strong className='letter-font'> <h1>Generacion Autimatizada de Contenido Académico</h1></strong></header>
        <br />
        <div className="row">
          <div className="col">
            <br />
            <div>

            </div>
            <br />
            <div>
              <br />
            </div>
          </div>
          <div className="col">
            <label className='  letter-font' htmlFor="">Key GPT</label> <br />
            <input
              type="text"
              value={apiKey}
              onChange={(e) => {
                const value = e.target.value;
                setApiKey(value);
                localStorage.setItem('apiKey', value); // Guarda el valor en el almacenamiento local
              }}
              className='sombra letter-font form-control'
              placeholder='Escribe tu key de API GPT ...'
            /> <br />
            <label className='  letter-font' htmlFor="">Titulo</label> <br />
            <input type="text" onChange={({ target: { value } }) => setMainTopic(value)} className=' sombra letter-font form-control' placeholder='Escribe tu tema ...' /> <br />
            <button type="button" onClick={handleGenerate} className="letter-font sombra position-absolute bottom-0 start-50 translate-middle-x generate btn btn-danger">Generar</button>
            <br />
            <label className='  letter-font' htmlFor="">¿Que deseas primero?</label> <br />
            <select onChange={({ target: { value } }) => setIntro(value)} className=' sombra form-select'>
              <option className='letter-font' value="">Elije una opcion</option>
              <option className='letter-font' value="introduccion">Introduccion</option>
              <option className='letter-font' value="resumen">Resumen</option>
              <option className='letter-font' value="descripcion">Descripcion</option>
            </select> <br />
            <label className='letter-font' htmlFor="">¿Cuantos ejercicios practicos desea?</label> <br />
            <select className=' sombra form-select' onChange={({ target: { value } }) => setExercises(value)}>
              <option className='letter-font' value="">Elije una opcion</option>
              <option className='letter-font' value="1">1</option>
              <option className='letter-font' value="2">2</option>
              <option className='letter-font' value="3">3</option>
              <option className='letter-font' value="4">4</option>
              <option className='letter-font' value="5">5</option>
            </select> <br />
            <br />
            <div>
              <label className='letter-font' htmlFor="">Bateria de Preguntas:</label> <br />
              <label className='letter-font' htmlFor="">¿Cuantas preguntas necesitas?</label> <br />
              <input type="number" onChange={({ target: { value } }) => setQuestions(value)} className='letter-font sombra form-control' placeholder='numero de preguntas ...' />
            </div>
          </div>

          <div className="col">

          </div>
        </div>
      </div>
      {generatedQuestions && (
        <div className="generated-content">
          <h1 className='descargatitulo'>↑ descargar contenido ↑</h1>
          <button onClick={generateDocument} className=' sombra letter-font position-absolute bottom-0 start-50 translate-middle-x generate btn btn-descargar btn-danger'>
            Descargar</button>
          {/* Puedes agregar lógica para descargar el contendido como un archivo Word aquí */}
        </div>
      )}

      <footer>
        <figure className="logo_foot">
          <img src="" />
        </figure>
        <section className="info mx-5">
          <section className="secciones grow">
            <p>SECCIONES</p>
            <a href="">
              <p>¿Quiénes somos?</p>
            </a>
            <a href="">
              <p>¿Qué hacemos?</p>
            </a>
            <a href="">
              <p>Términos y condiciones</p>
            </a>
          </section>
          <section className="informacion grow">
            <p>INFORMACIÓN</p>
            <section className="nav-info">
              <a href="index.html">
                <p>Level up</p>
              </a>
              <a href="index.html#programas">
                <p>Programas</p>
              </a>
              <a href="index.html#contacto">
                <p>Contacto</p>
              </a>
              <a href="form.html">
                <p>Aplicar</p>
              </a>
              <a href="mentor.html">
                <p>Ser mentor</p>
              </a>
              <a href="index.html#vovacion">
                <p>¿Por qué Level up?</p>
              </a>
            </section>
          </section>
          <section className="redes grow">
            <p>SIGUENOS EN</p>
            <div className="sm_nav">
              <a href="https://www.facebook.com/somoslevelup/"><i className="fa-brands fa-facebook"></i></a>
              <a href="https://www.linkedin.com/company/somoslevelup"><i className="fa-brands fa-linkedin"></i></a>
              <a href="https://instagram.com/somos_levelup?igshid=YmMyMTA2M2Y="><i className="fa-brands fa-instagram"></i></a>
            </div>
          </section>
        </section>
      </footer>
    </>
  )
}