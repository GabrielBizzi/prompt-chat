"use client";
import { LoadingComponent } from "@/components/Loading";
import { ModalComponent } from "@/components/Modal";
import axios from "axios";
import { RefreshCcw, SendHorizonal, Terminal, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

export interface IOpenAISuggestions {
  title?: string;
  suggestions: {
    text: string;
    example: string;
  }[];
}

export default function Home() {
  const [open, setOpen] = useState<boolean>(false);
  const [actualQuestion, setActualQuestion] = useState<string>("");
  const [archetype, setArchetype] = useState<string>("");
  const [bodySugestions, setBodySugestions] = useState<IOpenAISuggestions[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [actualAnswer, setActualAnswer] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{
    question: string;
    answer: string;
  }> | null>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });

  const formatBody = (body: string): IOpenAISuggestions[] => {
    const blocks = body.split(/\n\n+/);
    const formattedBlocks: IOpenAISuggestions[] = [];

    blocks.forEach((block) => {
      const lines = block.trim().split("\n-");
      const title = lines.shift()?.trim();
      const suggestions = lines.map((line) => {
        const [text, example] = line.trim().split(" (exemplo: ");
        return {
          text,
          example: example ? example.replace(")", "") : "",
        };
      });

      formattedBlocks.push({
        title: title,
        suggestions: suggestions,
      });
    });

    return formattedBlocks;
  };

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [actualQuestion]);

  useEffect(() => {
    async function fetchFirstQuestion() {
      try {
        const response = await api.get("/chat/question");

        setActualQuestion(response.data.pergunta);
      } catch (error) {
        console.error("Erro ao buscar a primeira pergunta:", error);
      }
    }
    fetchFirstQuestion();
  }, []);

  const sendAnswer = async () => {
    try {
      if (
        actualQuestion ===
        "Qual é a estratégia da marca para a sustentabilidade e responsabilidade social?"
      ) {
        setLoading(true);
      }

      if (actualAnswer) {
        const inputChat = document.getElementById("inputChat");
        const response = await api.post("/chat/answer", {
          answer: actualAnswer,
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
          setActualAnswer(null);
        } else {
          setHistory((prevHistory) => {
            const updatedHistory = [
              ...(prevHistory || []),
              { question: actualQuestion, answer: actualAnswer },
            ];

            return updatedHistory;
          });
          setOpen(true);
          setArchetype(response.data.arquetipo);
          const text = formatBody(response.data.body);
          setBodySugestions(text);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Erro ao enviar resposta:", error);
    }
  };

  const handleSubmit = () => {
    sendAnswer();
    setActualAnswer(null);
  };

  const handleRestart = async () => {
    setOpen(false);
    try {
      const response = await api.get("/chat/reload");
      window.location.reload();

      setActualQuestion(response.data.pergunta);
      setArchetype("");
      setHistory([]);
    } catch (error) {
      console.error("Erro ao reiniciar o questionário:", error);
    }
  };

  return (
    <>
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
                Archetype Prompt
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
                value={!!actualAnswer ? actualAnswer : ""}
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

        <LoadingComponent open={loading} />

        <ModalComponent
          title={archetype}
          open={open}
          setOpen={setOpen}
          onSubmit={handleRestart}
          toggle={handleRestart}
        >
          <h2 className="text-center text-zinc-50 text-2xl font-semibold">
            Seu arquétipo é {archetype}!
          </h2>

          <span className="text-center my-4 text-zinc-50 text-md block font-thin">
            Abaixo estarão algumas sugestões para sua empresa de acordo com seu
            arquétipo.
          </span>

          {bodySugestions &&
            bodySugestions.map((sugestion) => (
              <>
                <h2 className="text-left text-zinc-50 text-md font-semibold my-3">
                  {sugestion.title?.replaceAll("**", "").replaceAll(":", "")}
                </h2>
                <ul>
                  {sugestion.suggestions.map((suggestion, _index) => (
                    <li
                      className="text-justify text-zinc-300 text-md my-2"
                      key={_index}
                    >
                      &#x2022; {suggestion.text.trim()}
                    </li>
                  ))}
                </ul>
              </>
            ))}
        </ModalComponent>
      </div>
    </>
  );
}
