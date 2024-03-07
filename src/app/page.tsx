"use client";

import "regenerator-runtime/runtime";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import answerQuestion from "@/service/AISearch";
import { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import { SelectItem } from "@/components/ui/select";
import { populateVoiceList, sayInput } from "@/service/textToSpeech";
const selectValues = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
interface voiceProps {
  voiceURI: string;
  name: string;
  lang: string;
  default: boolean;
}

export default function Home() {
  const [voiceList, setVoiceList] = useState<any>([]);
  const [voiceOptions, setVoiceOptions] = useState([]);
  const [voice, setVoice] = useState("Alex");
  const [pitch, setPitch] = useState<number>(1);
  const [rate, setRate] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    const fetchVoices = () => {
      try {
        window.speechSynthesis.onvoiceschanged = () => {
          const data = populateVoiceList();
          console.log(data);
          setVoiceList(data);
        };
      } catch (err) {
        console.log(err);
      }
    };
    fetchVoices();
  }, []);

  useEffect(() => {
    setVoiceOptions(
      voiceList.length ? (
        voiceList?.map(({ name, lang }: voiceProps, i: number) => (
          <SelectItem value={name} key={i}>
            {name} - {lang}
          </SelectItem>
        ))
      ) : (
        <SelectItem value="Alex">Alex - en-US</SelectItem>
      )
    );
  }, [voiceList]);

  useEffect(() => {
    setVoice((prevVoice: any) =>
      voiceList.length > 0
        ? voiceList?.filter((voice: any) => voice.default)[0].name
        : prevVoice
    );
  }, [voiceList]);

  const [evaluationDone, setEvaluationDone] = useState(false);
  const [evaluation, setEvaluation] = useState("");

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    setQuestion(transcript);
  }, [transcript]);

  const start = () => SpeechRecognition.startListening({ continuous: true });
  const stop = () => SpeechRecognition.stopListening();
  const reset_transcript = () => resetTranscript();
  const reset = () => setQuestion("");

  const search = async () => {
    if (!question) {
      alert("Please say something to search. Question cannot be empty.");
      return;
    }
    setLoading(true);
    const res = await answerQuestion(question);
    console.log(res);
    const response = res.answer || "";
    setEvaluation(response);
    setEvaluationDone(true);
    setLoading(false);
  };

  const handleSpeech = () => {
    sayInput(evaluation, voice, pitch, rate);
  };

  return (
    <>
      {loading && (
        <div className="flex justify-center items-center h-screen w-screen fixed opacity-50 bg-gray-400">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        </div>
      )}
      <main className="container min-h-screen p-6 sm:p-24">
        <div id="prerequisites" className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Hey! How can I help you
          </h2>
          <p>Microphone: {listening ? "on" : "off"}</p>
          <Textarea
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={start}>
              Record
            </Button>
            <Button variant="secondary" onClick={stop}>
              Stop
            </Button>
            <Button variant="destructive" onClick={reset}>
              Reset
            </Button>
            <Button variant="default" onClick={search}>
              Search
            </Button>
          </div>
        </div>

        {evaluationDone && (
          <>
            <hr></hr>
            <div className="my-12">
              <h2 className="text-3xl font-bold mb-6 text-center">Answer</h2>
              <div className="mb-12 flex gap-2">
                <Button type="button" onClick={handleSpeech}>
                  Read
                </Button>
                <Button
                  type="button"
                  onClick={() => window.speechSynthesis.pause()}
                >
                  Pause
                </Button>
                <Button
                  type="button"
                  onClick={() => window.speechSynthesis.resume()}
                >
                  Resume
                </Button>
                <Button
                  type="button"
                  onClick={() => window.speechSynthesis.cancel()}
                >
                  Stop
                </Button>
              </div>
              <div className="mb-12">
                <div className="border rounded-lg px-3 py-2 sm:p-6">
                  {evaluation}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
