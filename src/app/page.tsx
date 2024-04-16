"use client";
import axios from "axios";
import { RefreshCcw, SendHorizonal, Terminal, User } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

export default function Home() {
  const [questions, setQuestions] = useState<Array<string> | null>(null);
  const [actualQuestion, setActualQuestion] = useState<string>("");
  const [archetype, setArchetype] = useState<string>("");
  const [answers, setAnswers] = useState<Array<string> | null>(null);
  const [actualAnswer, setActualAnswer] = useState<string>("");
  const [history, setHistory] = useState<Array<{
    question: string;
    answer: string;
  }> | null>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const nagivate = useRouter();

  const api = axios.create({
    baseURL: "http://localhost:3333",
  });

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [actualQuestion]);

  useEffect(() => {
    async function fetchFirstQuestion() {
      try {
        const response = await api.get("/primeira-pergunta");

        setActualQuestion(response.data.pergunta);
      } catch (error) {
        console.error("Erro ao buscar a primeira pergunta:", error);
      }
    }
    fetchFirstQuestion();
  }, []);

  const sendAnswer = async () => {
    try {
      const inputChat = document.getElementById("inputChat");
      const response = await api.post("/resposta", {
        resposta: actualAnswer,
      });

      if (response.data.pergunta) {
        setActualQuestion(response.data.pergunta);
        setHistory((prevHistory) => {
          const updatedHistory = [
            ...(prevHistory || []),
            { question: actualQuestion, answer: actualAnswer },
          ];
          inputChat?.focus();
          return updatedHistory;
        });
      } else {
        setArchetype(response.data.arquetipo);
      }
    } catch (error) {
      console.error("Erro ao enviar resposta:", error);
    }
  };

  const handleSubmit = () => {
    sendAnswer();
    setActualAnswer("");
  };

  const handleRestart = async () => {
    try {
      const response = await api.get("/reiniciar");
      window.location.reload();

      setActualQuestion(response.data.pergunta);
      setArchetype("");
      setHistory([]);
    } catch (error) {
      console.error("Erro ao reiniciar o questionário:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1">
        <main className="flex flex-col flex-1 px-16 py-6">
          <div className="flex items-center mt-9 flex-row">
            <button
              onClick={handleRestart}
              className="p-2 rounded-full mr-2 flex items-center hover:bg-zinc-700 transition-colors cursor-pointer justify-center"
            >
              <RefreshCcw className="text-zinc-500 text-xl hover:text-zinc-300" />
            </button>
            <h1 className="font-semibold text-2xl text-zinc-300">
              Archetype Prompt {archetype && `: ${archetype}`}
            </h1>
          </div>
          <div
            style={{
              maxHeight: "550px",
            }}
            className="flex flex-1 flex-col mt-8 gap-4 pr-4 w-auto overflow-auto"
          >
            {history &&
              history.length > 0 &&
              history.map((chat) => (
                <>
                  <div className="flex p-6 flex-row gap-4 items-center text-xl  bg-zinc-800 rounded w-full">
                    <div className="p-3 rounded-full bg-zinc-900 flex items-center justify-center">
                      <Terminal color="#fff" />
                    </div>
                    <p className="text-zinc-300">{chat.question}</p>
                  </div>

                  <div className="flex p-6 flex-row gap-4 items-center text-xl  bg-zinc-800 rounded w-full">
                    <div className="p-3 rounded-full bg-zinc-100 flex items-center justify-center">
                      <User color="#0c0c0c" />
                    </div>
                    <p className="text-zinc-300">{chat.answer}</p>
                  </div>
                </>
              ))}

            {actualQuestion && (
              <div
                ref={lastMessageRef}
                className="flex p-6 flex-row gap-4 items-center text-xl  bg-zinc-800 rounded w-full"
              >
                <div className="p-3 rounded-full bg-zinc-900 flex items-center justify-center">
                  <Terminal color="#fff" />
                </div>
                <p className="text-zinc-300">{actualQuestion}</p>
              </div>
            )}
          </div>

          <div className="flex mt-4 px-8 py-6 flex-row gap-4 items-center text-xl justify-between  bg-zinc-800 rounded w-full">
            <input
              className="outline-none w-full h-full bg-zinc-800 text-zinc-300"
              value={actualAnswer}
              id="inputChat"
              onChange={(e) => setActualAnswer(e.target.value)}
              placeholder="Type a text..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
            />

            <button
              onClick={handleSubmit}
              className="p-3 group rounded-full flex items-center hover:bg-zinc-700 transition-colors cursor-pointer justify-center"
            >
              <SendHorizonal className="text-zinc-700 text-xl group-hover:text-zinc-500" />
            </button>
          </div>
        </main>
        <aside className="w-96 p-6 flex flex-col items-center border-l  border-zinc-800">
          <h1 className="font-semibold text-2xl mt-9 text-zinc-300">
            Trending prompts
          </h1>
          <div className="mt-9 flex flex-col items-center gap-8">
            <div className="flex w-60 flex-col items-center justify-center p-6 bg-zinc-800 hover:bg-zinc-700 hover:scale-105 cursor-pointer transition-all rounded">
              <h2 className="font-semibold text-center text-1xl text-zinc-300">
                Catch Email Subject
              </h2>
              <span className="font-semibold mt-2 text-sm text-zinc-300">
                by sync
              </span>
            </div>

            <div className="flex w-60 flex-col items-center justify-center p-6 bg-zinc-800 hover:bg-zinc-700 hover:scale-105 cursor-pointer transition-all rounded">
              <h2 className="font-semibold text-center text-1xl text-zinc-300">
                SET Meta Description
              </h2>
              <span className="font-semibold mt-2 text-sm text-zinc-300">
                by sync
              </span>
            </div>

            <div className="flex w-60 flex-col items-center justify-center p-6 bg-zinc-800 hover:bg-zinc-700 hover:scale-105 cursor-pointer transition-all rounded">
              <h2 className="font-semibold text-center text-1xl text-zinc-300">
                Amazon Product Description
              </h2>
              <span className="font-semibold mt-2 text-sm text-zinc-300">
                by sync
              </span>
            </div>
          </div>
        </aside>
      </div>
      <footer className="p-8 text-center">
        <span className=" text-zinc-700">&copy; Prompts. by Acelerai</span>
      </footer>
    </div>
  );
}
