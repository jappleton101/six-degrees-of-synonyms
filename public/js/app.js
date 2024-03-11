const successfulStyle = {
    background: "green"
}

const lockedStyle = {
    background: "grey"
}

class PuzzleBoard extends React.Component {
    state = {
        puzzle: {},
        session: {
            inputStatus: ["open", "locked", "locked", "locked", "locked"],
            guesses: []
        },
        currentGuess: "",
        currentNode: "",
        statusMessage: "Ready to play?",
        wordBankEnabled: false
    }

    componentDidMount() {
        this.loadDailyFromServer();
    }

    loadDailyFromServer = () => { 
        client.getDaily((dailyPuzzle)=>(
            this.setState({ puzzle: dailyPuzzle })
        ))
    }

    handleShowWordBank = (wordBankBoolean) => {
        this.setState({
            wordBankEnabled: !wordBankBoolean
        })
    }

    handleRandomButtonClick = () => {
        client.getRandomPuzzle((randomPuzzle)=>(
            this.setState({ 
                puzzle: randomPuzzle,
                session: {
                    inputStatus: ["open", "locked", "locked", "locked", "locked"],
                    guesses: []
                },
                currentGuess: "",
                currentNode: "",
                statusMessage: "Ready to play?",
                wordBankEnabled: false
            }, function() {
                for(let i = 0; i<5; i++){
                    console.log(document.getElementById("level_"+i))
                    document.getElementById("level_"+i).value = "";
                }
            })
        ))
    }

    handlePuzzleGuessSubmit = (guess, currentNode) => {
        let newState = Object.assign({}, this.state)

        // handleEmpty Guess
        if(!currentNode || guess === ""){
            this.setState({
                session: newState.session,
                statusMessage: "Enter a guess!"
            }, function(){
                console.log(this.state.statusMessage);
            })
        } else {
            let guessPosition = parseInt(currentNode.split("_").slice(-1));
            let newSession = Object.assign({}, this.state.session)
            
            // handleCorrectGuess
            if(this.state.puzzle.answers[guessPosition].indexOf(guess.toLowerCase()) !== -1){
                newSession.guesses.push(guess.toLowerCase());

                const newInputStatus = [...this.state.session.inputStatus];
                newInputStatus[guessPosition] = "correct";

                if(guessPosition !== 4){
                    newInputStatus[guessPosition+1] = "open";   
                } 

                newSession.inputStatus = newInputStatus;

                this.setState({
                    session: newSession,
                    currentGuess: "",
                    statusMessage: "Correct!"
                }, function(){
                    console.log(this.state.statusMessage);
                })
            } else {

                let answerField = document.getElementById(currentNode);
                if(this.state.session.guesses.indexOf(guess.toLowerCase()) === -1){
                    // Handle incorrect guess
                    answerField.value = "";
                    newSession.guesses.push(guess.toLowerCase());
                    newSession = newState.session;

                    this.setState({
                        session: newSession,
                        currentGuess: "",
                        statusMessage: "'"+ guess+"' was incorrect, try again!"
                    }, function(){
                        console.log(this.state.statusMessage);
                    })
                } else {
                    // handle duplicate guess
                    answerField.value = "";
                    this.setState({
                        session: newSession,
                        currentGuess: "",
                        statusMessage: "Try something other than, '"+ guess +"'."
                    }, function(){
                        console.log(this.state.statusMessage);
                    })
                }
            }
        }
        
    }

    hanldePuzzleGiveUp = (currentNode) => {
        let nodeValue = currentNode;
        let puzzleField = document.getElementById("level_" + nodeValue);
        let giveUpSession = Object.assign({}, this.state.session)

        while(nodeValue <= 4){
            puzzleField = document.getElementById("level_" + nodeValue);
            puzzleField.value = this.state.puzzle.answers[nodeValue];
            giveUpSession.inputStatus[nodeValue] = "locked";
            nodeValue++;
        }

        this.setState({
            session: giveUpSession,
            statusMessage: "Game over!"
        }, function(){
            console.log(this.state.statusMessage);
        })
    }

    render() {
        return (
            <div className="ui three column centered grid">
                <div className="column">
                    <div className="ui centered card">
                        <div className="content">
                            <StatusBar
                                session={this.state.session}
                            />
                            <PuzzleLadder
                                puzzle={this.state.puzzle}
                                session={this.state.session}
                                showWordBank={this.state.wordBankEnabled}
                                onSubmitClick={this.handlePuzzleGuessSubmit}
                                onGiveUpClick={this.hanldePuzzleGiveUp}
                                onRandomClick={this.handleRandomButtonClick}
                                onWordBankClick={this.handleShowWordBank}
                                statusMessageProp={this.state.statusMessage}
                            />
                        </div>
                    </div>
                </div>
                {/* {this.state.wordBankEnabled === true ? (<div className="column">
                    <div className="ui centered card">
                        <div className="content">
                            <div className="ui dividing header centered"> 
                                <p>Word Bank</p>
                            </div>
                        </div>
                    </div>
                </div>) : null} */}
            </div>
        )
    }
}

class StatusBar extends React.Component {
    render() {

        let emoji = "🧐";
        let guessCount = this.props.session.guesses.length;

        if(this.props.session.inputStatus.lastIndexOf("correct") === 4){
            if(guessCount < 10){
                emoji = "🤩"
            } else if(guessCount < 20){
                emoji = "😊"
            } else if(guessCount < 30){ 
                emoji = "😐"
            } else {
                emoji = "😵"
            }
        } 

        if(this.props.session.inputStatus.indexOf("open")===-1 && this.props.session.inputStatus.lastIndexOf("correct") !== 4){
            emoji = "☠️"
        }

        return (
            <div className="ui dividing header centered"> 
                {"Guess Count: " + this.props.session.guesses.length + "\t" }
                <br/>
                <p className="ui header large">{emoji}</p>
            </div>
        )
    }
}

class PuzzleLadder extends React.Component {
    state = {
        
    }

    handleRandomClick = () => {
        this.props.onRandomClick()
    }

    handleGuessChange = (e) => {
        this.setState({
            currentGuess: e.target.value.toLowerCase(),
            currentNode: e.target.id
        })
    }

    handleSubmitClick = () => {
        this.props.onSubmitClick(this.state.currentGuess, this.state.currentNode);
        this.setState({
            currentGuess: ""
        })
    }

    handleGiveUpClick = () => {
        this.props.onGiveUpClick(this.props.session.inputStatus.indexOf("open"));
    }

    handleShowWordBankClick = () => {
        this.props.onWordBankClick(this.props.showWordBank);
    }

    render() {
        if(this.props.puzzle.ladder){
            let puzzleLadder = [];

            puzzleLadder.push(<ClueSegment clueWord={this.props.puzzle.ladder[this.props.puzzle.ladder.length-1]} idProp="clue_5"/>)
            for(let i = this.props.puzzle.answers.length-1; i>=0; i--){
                puzzleLadder.push(
                    <AnswerInputSegment 
                        idProp={"level_"+i} 
                        inpuStatusProp={this.props.session.inputStatus[i]}
                        guessChangeProp={this.handleGuessChange}
                        handleSubmitProp={this.handleSubmitClick}
                    />
                )

                puzzleLadder.push(<ClueSegment clueWord={this.props.puzzle.ladder[i]} idProp={"clue_"+i} />)
            }

            return (
                <div className="ui form">
                    <div className="ui padded grid center aligned">
                            {puzzleLadder}
                    </div>
                    <div className="ui section divider"></div>
                    <ButtonSection
                        puzzle={this.props.puzzle}
                        session={this.props.session}
                        onSubmitClick={this.handleSubmitClick}
                        onGiveUpClick={this.handleGiveUpClick}
                        onRandomClick={this.handleRandomClick}
                        onToggleWordBankClick={this.handleShowWordBankClick}
                        statusMessageProp={this.props.statusMessageProp}
                        showWordBank={this.props.showWordBank}
                    />
                </div>
            )
        } else {
            return (
                <div className="ui form">
                    <p>Your puzzle is on the way...</p>
                    <div className="ui loading segment">
                    </div>
                    <br/>
                </div>
            )
        }
    }
}

class AnswerInputSegment extends React.Component {
    render() {
        return (
            <div className="ui white row">
                <div className={this.props.inpuStatusProp === "open" ? "ui focus left icon input" : "ui transparent left icon input"}>
                    <input type="text" 
                        onChange={this.props.guessChangeProp}
                        onSubmit={this.props.handleSubmitProp}
                        id={this.props.idProp}
                        placeholder={this.props.inpuStatusProp === "open" ? "Enter a guess" : "Locked"} 
                        disabled={this.props.inpuStatusProp === "open" ? false : true}
                    />
                    <i className={this.props.inpuStatusProp === "open" ? "arrow up icon" : 
                                  this.props.inpuStatusProp === "correct" ? "check circle icon green" : 
                                  "lock icon"}
                    />
                </div>
            </div>
        )

    }

}

class ClueSegment extends React.Component {
    render() {
        return (
            <div id={this.props.idProp}>
                <h3 className="ui center aligned">{this.props.clueWord}</h3>
            </div>
        )

    }

}

class ButtonSection extends React.Component {
    render() {
        return (
            <div>
                <div className="ui center aligned grid">
                    <p className="ui white label">{this.props.statusMessageProp}</p>
                </div>
                <br/>
                <div className="ui two bottom attached buttons">
                    <button 
                        type="text"
                        className="ui primary blue button"
                        id="guess"
                        onClick={this.props.onSubmitClick}
                    >
                        Guess
                    </button>
                </div>
                <br/>
                <div className="ui two bottom attached buttons">
                    {/* <button 
                            type="text"
                            className={this.props.showWordBank === false ? "ui basic green button" : "ui basic red button"}
                            id="hint"
                            onClick={this.props.onToggleWordBankClick}
                        >
                            {this.props.showWordBank === false ? "Enable Word Bank" : "Hide Word Bank"}
                    </button> */}
                    <button 
                        className="ui basic red button"
                        id="giveup"
                        onClick={this.props.onGiveUpClick}
                    >
                        Reveal Answers
                    </button>
                </div>
                <br/>
                <div className="ui two bottom attached buttons">
                    <button 
                        type="text"
                        className="ui secondary button"
                        id="random"
                        onClick={this.props.onRandomClick}
                    >
                        Random Puzzle
                    </button>
                </div>
            </div>
        )

    }
}
        

ReactDOM.render(
    <PuzzleBoard />,
    document.getElementById('content')
)