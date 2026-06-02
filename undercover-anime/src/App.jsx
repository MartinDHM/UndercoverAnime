import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import data from "./data.json";

export default function App() {
  const [players, setPlayers] = useState(4);
  const [names, setNames] = useState(["Joueur 1", "Joueur 2", "Joueur 3"]);
  const [roles, setRoles] = useState([]);
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showStartMessage, setShowStartMessage] = useState(false);
  const [revealAll, setRevealAll] = useState(false);
  const [recentAnimes, setRecentAnimes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [impostorMode, setImpostorMode] = useState(false);
  const [undercoverIndex, setUndercoverIndex] = useState(null);
  const [hint, setHint] = useState("");
  const [votes, setVotes] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [mrWhiteMode, setMrWhiteMode] = useState(false);
  const [mrWhiteIndex, setMrWhiteIndex] = useState(null);
  const [secretWord, setSecretWord] = useState("");
  const [guess, setGuess] = useState("");
  const maxVotes = votes.length > 0 ? Math.max(...votes) : 0;
  const mostVotedIndex = votes.indexOf(maxVotes);
  const isMrWhiteEliminated = mrWhiteMode && mostVotedIndex === mrWhiteIndex;
  const mrWhiteCanGuess = isMrWhiteEliminated && !showResults;
  const mrWhiteWin =
    isMrWhiteEliminated &&
    guess.trim().toLowerCase() === secretWord.toLowerCase();
  const [votesValidated, setVotesValidated] = useState(false);
  const [usedIndexes, setUsedIndexes] = useState([]);

  // Met à jour les noms si nombre de joueurs change
  useEffect(() => {
    setNames((prev) => {
      const newNames = [...prev];
      while (newNames.length < players) {
        newNames.push(`Joueur ${newNames.length + 1}`);
      }
      return newNames.slice(0, players);
    });
  }, [players]);

  const getRandomPair = () => {
    // tous les index possibles
    const allIndexes = data.map((_, index) => index);

    // index non utilisés
    let availableIndexes = allIndexes.filter((i) => !usedIndexes.includes(i));

    // si tout a été utilisé → reset
    if (availableIndexes.length === 0) {
      setUsedIndexes([]);
      availableIndexes = allIndexes;
    }

    // pick aléatoire
    const randomIndex =
      availableIndexes[Math.floor(Math.random() * availableIndexes.length)];

    // ajouter à l’historique
    setUsedIndexes((prev) => [...prev, randomIndex]);

    return data[randomIndex];
  };

  const startGame = () => {
    const pair = getRandomPair();

    let newRoles = Array(players).fill(pair.civil);

    if (mrWhiteMode) {
      const whiteIndex = Math.floor(Math.random() * players);
      newRoles[whiteIndex] = "🤍 Mr White";
      setMrWhiteIndex(whiteIndex);
      setSecretWord(pair.civil);

      setUndercoverIndex(null); // important
    } else {
      const underIndex = Math.floor(Math.random() * players);
      newRoles[underIndex] = pair.undercover;

      setUndercoverIndex(underIndex);
      setMrWhiteIndex(null); // important
    }

    // 🔥 RESET COMMUN (TOUJOURS exécuté)
    setHint(pair.hint || "Indice mystère");
    setVotes(Array(players).fill(0));
    setShowResults(false);
    setRoles(newRoles);
    setNotes(Array(players).fill(""));
    setCurrent(0);
    setRevealed(false);
    setGameStarted(false);
    setRevealAll(false);
    setShowStartMessage(false);
    setGuess("");
    setVotesValidated(false);
  };

  const nextPlayer = () => {
    if (current + 1 < players) {
      setCurrent(current + 1);
      setRevealed(false);
    } else {
      setGameStarted(true); // 🔥 important
      setShowStartMessage(true);
    }
  };

  const goHome = () => {
    setRoles([]);
    setCurrent(0);
    setRevealed(false);
    setGameStarted(false);
    setShowStartMessage(false);
    setRevealAll(false);
    setVotes([]);
    setNotes([]);
    setShowResults(false);
    setVotesValidated(false);
    setMrWhiteIndex(null);
    setSecretWord("");
    setGuess("");
    setUndercoverIndex(null);
    setRecentAnimes([]);
  };

  const getAnimeName = (character) => {
    const match = character.match(/\(([^)]+)\)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!roles.length || gameStarted) return;

      if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") {
        e.preventDefault();

        if (!revealed) {
          setRevealed(true);
        } else {
          nextPlayer();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [revealed, roles, gameStarted, current]);

  const totalVotes = votes.reduce((sum, v) => sum + v, 0);
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white flex flex-col items-center justify-center p-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={goHome}
        className="text-4xl font-bold mb-6 text-pink-400 cursor-pointer hover:scale-105 transition"
      >
        🎌 Undercover Anime
      </motion.h1>
      {roles.length === 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <input
              className="imposteur"
              type="checkbox"
              checked={impostorMode}
              onChange={() => setImpostorMode(!impostorMode)}
            />
            <label className="font-semibold">Mode Imposteur Assisté 😈</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={mrWhiteMode}
              onChange={() => setMrWhiteMode(!mrWhiteMode)}
            />
            <label className="font-semibold">Mode Mr.White 🤍</label>
          </div>
        </div>
      )}{" "}
      {roles.length === 0 && (
        <motion.div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl w-full max-w-md">
          <p className="mb-2">Nombre de joueurs</p>
          <input
            type="number"
            min={3}
            max={10}
            value={players}
            onChange={(e) => setPlayers(Number(e.target.value))}
            className="bg-black/50 text-white p-2 rounded w-[70%] mb-4"
          />

          <p className="mb-2">Noms des joueurs</p>
          {names.map((name, index) => (
            <input
              key={index}
              type="text"
              value={name}
              onChange={(e) => {
                const newNames = [...names];
                newNames[index] = e.target.value;
                setNames(newNames);
              }}
              className="bg-black/50 text-white p-2 rounded mb-2"
            />
          ))}

          <button
            onClick={startGame}
            className="bg-pink-500 px-4 py-2 rounded-xl w-[80%] mt-2"
          >
            Lancer la partie 🚀
          </button>
        </motion.div>
      )}
      {roles.length > 0 && !gameStarted && (
        <motion.div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl text-center">
          <h2 className="text-xl mb-2">{names[current]}</h2>
          <p className="text-sm text-gray-400">
            Ordre de passage : {current + 1}
          </p>

          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="bg-blue-500 px-4 py-2 rounded-xl"
            >
              Voir mon rôle 👀
            </button>
          ) : (
            <motion.div className="mt-4">
              <p className="text-2xl text-yellow-300">{roles[current]}</p>

              {impostorMode && current === undercoverIndex && (
                <p className="text-red-400 mt-2">
                  ⚠️ Tu es l’imposteur !
                  <br />
                  Indice : {hint}
                </p>
              )}
            </motion.div>
          )}

          <button
            onClick={nextPlayer}
            className="mt-6 bg-green-500 px-4 py-2 rounded-xl"
          >
            Joueur suivant ➡️
          </button>
        </motion.div>
      )}
      {showStartMessage && !revealAll && (
        <motion.div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-3xl text-green-400 mb-4 text-center">
            🎉 La partie peut commencer !
          </h2>

          <p className="mb-3 text-center text-sm text-gray-300">
            Notez les mots dits par chaque joueur :
          </p>

          {names.map((name, index) => (
            <div key={index} className="mb-3">
              <label className="block text-sm mb-1">{name}</label>
              <input
                type="text"
                value={notes[index]}
                onChange={(e) => {
                  const newNotes = [...notes];
                  newNotes[index] = e.target.value;
                  setNotes(newNotes);
                }}
                className="bg-black/50 text-white p-2 rounded w-[40%]"
                placeholder="Mot ou indice..."
              />
            </div>
          ))}

          <button
            onClick={() => setRevealAll(true)}
            className="bg-red-500 px-4 py-2 rounded-xl w-[60%] mt-4"
          >
            Passer au vote 🗳️
          </button>
        </motion.div>
      )}
      {/* PHASE DE VOTE */}
      {revealAll && !showResults && (
        <motion.div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl text-center mb-4">
            🗳️ Votez pour l'imposteur
          </h2>

          {/* VOTE */}
          {!votesValidated && (
            <>
              {names.map((name, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center mb-3"
                >
                  <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-gray-400">
                      Mot : {notes[index] || "Aucun mot"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newVotes = [...votes];
                        if (newVotes[index] > 0) {
                          newVotes[index]--;
                          setVotes(newVotes);
                        }
                      }}
                    >
                      -1
                    </button>

                    <button
                      onClick={() => {
                        if (totalVotes < players) {
                          const newVotes = [...votes];
                          newVotes[index]++;
                          setVotes(newVotes);
                        }
                      }}
                      disabled={totalVotes >= players}
                    >
                      +1 ({votes[index]})
                    </button>
                  </div>
                </div>
              ))}

              {/* ✅ BOUTON VALIDER */}
              <button
                onClick={() => setVotesValidated(true)}
                className="bg-blue-500 px-4 py-2 rounded-xl w-[50%] mt-4"
              >
                Valider les votes ✅
              </button>
            </>
          )}

          {/* 🧠 APRÈS VALIDATION */}
          {votesValidated && (
            <div className="text-center mt-4">
              {mrWhiteMode ? (
                <>
                  {isMrWhiteEliminated ? (
                    <>
                      <h2 className="text-yellow-300 mb-2">
                        🤍 Mr.White a été trouvé !
                      </h2>

                      <p className="mb-2">Il peut tenter de deviner le mot :</p>
                      <div className="mt-4 text-left">
                        <p className="text-sm text-gray-300 mb-2">
                          🧠 Mots donnés par les joueurs :
                        </p>

                        {notes.map((note, index) => (
                          <p key={index} className="text-white/80 text-sm">
                            • {names[index]} : {note || "Aucun mot"}
                          </p>
                        ))}
                      </div>
                      <input
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        className="bg-black/50 text-white p-2 rounded text-center"
                        placeholder="Devine le mot..."
                      />

                      <button
                        onClick={() => setShowResults(true)}
                        disabled={guess.trim() === ""}
                        className="bg-green-500 px-4 py-2 rounded-xl w-[50%] mt-4"
                      >
                        Voir les résultats 📊
                      </button>
                    </>
                  ) : (
                    <>
                      <h2 className="text-green-400">
                        🤍 Mr.White a gagné ! (non trouvé)
                      </h2>

                      {/* 🔥 DIRECT RESULT */}
                      <button
                        onClick={() => setShowResults(true)}
                        className="bg-green-500 px-4 py-2 rounded-xl w-[50%] mt-4"
                      >
                        Voir les résultats 📊
                      </button>
                    </>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setShowResults(true)}
                  className="bg-green-500 px-4 py-2 rounded-xl w-full mt-4"
                >
                  Voir les résultats 📊
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}
      {/* ÉCRAN RÉCAPITULATIF */}
      {showResults && (
        <motion.div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl text-center mb-4 text-yellow-400">
            📊 Récapitulatif de la partie
          </h2>

          {mrWhiteMode ? (
            <div className="text-center mb-4">
              {mrWhiteWin ? (
                <h2 className="text-green-400">🤍 Mr.White a gagné !</h2>
              ) : isMrWhiteEliminated ? (
                <h2 className="text-red-400">👥 Les joueurs ont gagné !</h2>
              ) : (
                <h2 className="text-red-400">🤍 Mr.White a survécu !</h2>
              )}
              <p className="mt-2">Mot : {secretWord}</p>
              <p>Mr.White : {names[mrWhiteIndex]}</p>
            </div>
          ) : (
            <div className="text-center mb-4">
              <p className="text-red-400 font-bold">
                😈 L'imposteur était : {names[undercoverIndex]}
              </p>
            </div>
          )}

          {names.map((name, index) => (
            <div key={index} className="mb-3 border-b border-white/20 pb-2">
              <p>
                <strong>{name}</strong>
              </p>
              <p>Rôle : {roles[index]}</p>
              <p>Mot : {notes[index] || "Aucun"}</p>
              <p>Votes reçus : {votes[index]}</p>
            </div>
          ))}

          <div className="mt-4 text-center">
            <p>
              🏆 Joueur le plus voté :{" "}
              {names[votes.indexOf(Math.max(...votes))]}
            </p>
          </div>

          <button
            onClick={startGame}
            className="bg-pink-500 px-4 py-2 rounded-xl w-[60%] mt-4"
          >
            Nouvelle partie 🚀
          </button>

          <button
            onClick={goHome}
            className="bg-gray-500 px-4 py-2 rounded-xl w-[60%] mt-2"
          >
            Retour accueil 🏠
          </button>
        </motion.div>
      )}
    </div>
  );
}
