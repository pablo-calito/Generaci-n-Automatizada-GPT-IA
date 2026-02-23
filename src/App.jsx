import React, { useState } from 'react';
import './index.css'
import axios from 'axios';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils/index.js';
import { saveAs } from 'file-saver';

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
  const [loading, setLoading] = useState(false);

  const generateDocument = () => {
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
          doc.render();
        } catch (error) {
          function replaceErrors(key, value) {
            if (value instanceof Error) {
              return Object.getOwnPropertyNames(value).reduce(function (err, key) {
                err[key] = value[key];
                return err;
              }, {});
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
          }
          throw error;
        }
        var out = doc.getZip().generate({
          type: 'blob',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        saveAs(out, `${mainTopic}.docx`);
      }
    );
  };

  const generateIntro = async () => {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'openai/gpt-oss-20b',
          messages: [
            {
              role: 'user',
              content: `Generame una ${intro} del tema ${mainTopic} en contexto de programacion, facil para la lectura de 300 palabras y para un documento word`,
            },
          ],
          max_tokens: 3000,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const result = response.data.choices[0].message.content;
      setGeneratedIntro(result);
      return result;
    } catch (error) {
      console.error('Error al generar la intro:', error.response?.data || error);
    }
  };

  const generateExercises = async () => {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'openai/gpt-oss-20b',
          messages: [
            {
              role: 'user',
              content: `Generame ${exercises} ejercicios practicos del tema ${mainTopic}, facil para la lectura y para un formato word, solo necesito los ejercicios`,
            },
          ],
          max_tokens: 3000,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const result = response.data.choices[0].message.content;
      setGeneratedExercises(result);
      return result;
    } catch (error) {
      console.error('Error al generar ejercicios:', error.response?.data || error);
    }
  };

  const generateQuestions = async () => {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'openai/gpt-oss-20b',
          messages: [
            {
              role: 'user',
              content: `Necesito una bateria de preguntas que contenga un total de ${questions} del tema ${mainTopic}, necesito que las preguntas sean variadas, por ejemplo preguntas de opcion multiple, respuesta directa o verdadero o falso, respondeme solo con las preguntas`,
            },
          ],
          max_tokens: 3000,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const result = response.data.choices[0].message.content;
      setGeneratedQuestions(result);
      return result;
    } catch (error) {
      console.error('Error al generar preguntas:', error.response?.data || error);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateIntro();
      await generateExercises();
      await generateQuestions();
    } catch (error) {
      console.error('Error en la generacion:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Banner inicial */}
      <div id="banner">
        <p className="bn_t1">¡ENTRENA CON NOSOTROS!</p>
        <p className="bn_t2">
          <a href="#">Aplicar aquí</a> y haz realidad tu sueño de ser el Techie o Digital Marketer que has soñado.
        </p>
      </div>

      {/* Navbar Level Up */}
      <section id="menu">
        <a className="logo" href="#">
          <img src="https://levelup.gt/img/logo_negativo.png" alt="Logo" />
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
        <header>
          <strong className='letter-font'>
            <h1>Generación Automatizada de Contenido Académico</h1>
          </strong>
        </header>
        <br />
        <div className="row">
          <div className="col"></div>
          <div className="col">
            <label className='letter-font' htmlFor="apiKey">Key Groq</label><br />
            <input
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={(e) => {
                const value = e.target.value;
                setApiKey(value);
                localStorage.setItem('apiKey', value);
              }}
              className='sombra letter-font form-control'
              placeholder='Escribe tu key de API Groq ...'
            /><br />

            <label className='letter-font' htmlFor="titulo">Titulo</label><br />
            <input
              id="titulo"
              type="text"
              onChange={({ target: { value } }) => setMainTopic(value)}
              className='sombra letter-font form-control'
              placeholder='Escribe tu tema ...'
            /><br />

            <label className='letter-font' htmlFor="intro">¿Qué deseas primero?</label><br />
            <select
              id="intro"
              onChange={({ target: { value } }) => setIntro(value)}
              className='sombra form-select'
            >
              <option className='letter-font' value="">Elige una opción</option>
              <option className='letter-font' value="introduccion">Introducción</option>
              <option className='letter-font' value="resumen">Resumen</option>
              <option className='letter-font' value="descripcion">Descripción</option>
            </select><br />

            <label className='letter-font' htmlFor="ejercicios">¿Cuántos ejercicios prácticos desea?</label><br />
            <select
              id="ejercicios"
              className='sombra form-select'
              onChange={({ target: { value } }) => setExercises(value)}
            >
              <option className='letter-font' value="">Elige una opción</option>
              <option className='letter-font' value="1">1</option>
              <option className='letter-font' value="2">2</option>
              <option className='letter-font' value="3">3</option>
              <option className='letter-font' value="4">4</option>
              <option className='letter-font' value="5">5</option>
            </select><br />

            <label className='letter-font' htmlFor="preguntas">¿Cuántas preguntas necesitas?</label><br />
            <input
              id="preguntas"
              type="number"
              onChange={({ target: { value } }) => setQuestions(value)}
              className='letter-font sombra form-control'
              placeholder='Número de preguntas ...'
            /><br />

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="letter-font sombra generate btn btn-danger"
            >
              {loading ? 'Generando...' : 'Generar'}
            </button>
          </div>
          <div className="col"></div>
        </div>
      </div>

      {generatedQuestions && (
        <div className="generated-content text-center mt-4">
          <h1 className='descargatitulo'>¡Contenido generado! Descárgalo aquí</h1>
          <button
            onClick={generateDocument}
            className='sombra letter-font generate btn btn-danger'
          >
            Descargar
          </button>
        </div>
      )}

      <footer>
        <figure className="logo_foot">
          <img src="" alt="Logo footer" />
        </figure>
        <section className="info mx-5">
          <section className="secciones grow">
            <p>SECCIONES</p>
            <a href=""><p>¿Quiénes somos?</p></a>
            <a href=""><p>¿Qué hacemos?</p></a>
            <a href=""><p>Términos y condiciones</p></a>
          </section>
          <section className="informacion grow">
            <p>INFORMACIÓN</p>
            <section className="nav-info">
              <a href="index.html"><p>Level up</p></a>
              <a href="index.html#programas"><p>Programas</p></a>
              <a href="index.html#contacto"><p>Contacto</p></a>
              <a href="form.html"><p>Aplicar</p></a>
              <a href="mentor.html"><p>Ser mentor</p></a>
              <a href="index.html#vovacion"><p>¿Por qué Level up?</p></a>
            </section>
          </section>
          <section className="redes grow">
            <p>SÍGUENOS EN</p>
            <div className="sm_nav">
              <a href="https://www.facebook.com/somoslevelup/"><i className="fa-brands fa-facebook"></i></a>
              <a href="https://www.linkedin.com/company/somoslevelup"><i className="fa-brands fa-linkedin"></i></a>
              <a href="https://instagram.com/somos_levelup?igshid=YmMyMTA2M2Y="><i className="fa-brands fa-instagram"></i></a>
            </div>
          </section>
        </section>
      </footer>
    </>
  );
};