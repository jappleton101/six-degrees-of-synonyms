window.client = (function () {
  function getDaily(success) {
    return fetch('/daily', {
      headers: {
        Accept: 'application/json',
      },
    }).then(parseJSON)
      .then(success);
  }

  function getRandomPuzzle(success) {
    return fetch('/random', {
      headers: {
        Accept: 'application/json',
      },
    }).then(parseJSON)
      .then(success);
  }

  function submitGuess() {
    console.log("Guess")
  }



  function parseJSON(response) {
    return response.json();
  }

  return {
    getDaily,
    submitGuess,
    getRandomPuzzle,
  };
}());
