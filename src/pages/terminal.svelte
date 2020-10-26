<script>
    import Textfield from '@smui/textfield'
    import Card from '@smui/card'
    import Button from '@smui/button';
    import Paper, {Title, Subtitle, Content} from '@smui/paper';
    import { currPlayer, addPoint, minusPoint, players_value, player_index } from '../playerService';
    // import { currentPlayer, players} from '../components/stores.js';



    let prompt = ['~%', '~%', '/Users ~%', '~%', 'stuff ~%', '~%', '~%', '~%', '~%', '~%', '~%'];
    let counter = 0
    let input;
    let answer = ['pwd', 'ls', 'cd ..', 'clear', 'cd guest/stuff', 'touch file.txt', 'mkdir things', 'cat file', 'cp file doc', "rm file"]
    const toggle = []
    const show = [true]

    const questions = [
        {
            msg: 'Print working directory',
            id: 0
        },
        {
            msg: '/Users/guest -now list the directories contents',
            id: 1
        },
        {
            msg: 'Documents stuff journal.txt -now move up a level in the directory',
            id: 2
        },
        {
            msg: "/Users -now clear the screen",
            id: 3
        },
        {
            msg: '-now navigate to stuff in one command (hint: its inside the guest directory',
            id: 4
        },
        {
            msg: '-now create a text file named file',
            id: 5
        },
        {
            msg: '-now create the directory things',
            id: 6
        },
        {
            msg: '-now display the contents of file',
            id: 7
        },
        {
            msg: 'How did any text get in Here? Now copy file to doc',
            id: 8
        },
        {
            msg: 'remove file',
            id: 9
        },
        {
            msg: 'You completed all the tasks',
            id: 10
        }
    ]

    // let rand = () => Math.floor(Math.random()*questions.length)

    let play = (guess, questionNum) => {
        clear(guess)
        guess === answer[questionNum] ? show[questionNum+1] = true : toggle[questionNum] = true;
        input = '';
        if (show[questionNum+1]) {counter++; addPoint()}
    }

    let clear = guess => guess === 'clear' && show.forEach( (el, index) => show[index] = false);
    $: if (counter < 8 && toggle[counter]) minusPoint();

</script>

<main>
<Card padded>
    <h1>Terminal Challenge</h1>
    <p>
        This is a game where you must follow the instructions to become familiar with using the terminal. This isn't a real terminal so no using "*". If you succesfully complete a challenge you get a point. If you make a mistake you lose a point.
    </p>

    <h3>Here are some common commands to help you out.</h3>
    <div>
        <p>
            1.	
            cat filename -
            Displays a filename
        </p>
        <p>
            2.	
            cd dirname -
            Moves you to the identified directory
        </p>
        <p>
            3.	
            cp file1 file2 -
            Copies one file/directory to the specified location
        </p>
        <p>
            4.	
            file filename -
            Identifies the file type (binary, text, etc)
        </p>
        <p>
            5.	
            find filename dir -
            Finds a file/directory
        </p>
        <p>
            6.	
            head filename -
            Shows the beginning of a file
        </p>
        <p>
            7.	
            less filename -
            Browses through a file from the end or the beginning
        </p>
        <p>
            8.	
            ls dirname -
            Shows the contents of the directory specified
        </p>
        <p>
            9.	
            mkdir dirname -
            Creates the specified directory
        </p>
        <p>
            10.	
            more filename -
            Browses through a file from the beginning to the end
        </p>
        <p>
            11.
            mv file1 file2 -
            Moves the location of, or renames a file/directory
        </p>
        <p>
            12.	
            pwd -
            Shows the current directory the user is in
        </p>
        <p>
            13.
            rm filename -
            Removes a file
        </p>
        <p>
            14.	
            rmdir dirname -
            Removes a directory -
        </p>
        <p>
            15.	
            tail filename -
            Shows the end of a file
        </p>
        <p>
            16.	
            touch filename -
            Creates a blank file or modifies an existing file or its attributes
        </p>
        <p>
            17.	
            whereis filename -
            Shows the location of a file
        </p>
        <p>
            18.	
            which filename -
            Shows the location of a file if it is in your PATH
        </p>
    </div>

    <h4>Type in the requested command and hit enter or click the button to play.</h4>
</Card>
<br>
<Paper elevation={4}>
    <div class='terminal grn-border'>
        {#each questions as question (question.id)}
            {#if show[question.id]}
                    <p class='terminal'>{question.msg}</p>
            {:else if toggle[question.id]}
                try again.
            {/if}
        {/each}
        
        <form on:submit|preventDefault={() => play(input.toLowerCase(), counter)}>
            {$currPlayer.name}{prompt[counter]}<input class="grn-border"  type="text" placeholder="Enter commands here" bind:value={input}>
            <input class="grn-border"  type="submit" value="Enter"/>
        </form>
    </div>
</Paper>

</main>

<style>
    main {
        margin: 4px;
    }

    p {
        font-family: -apple-system;
    }

    .terminal {
        margin: 0px;
        padding: 0px;
        background-color: black;
        color: #FFB000;
        border-radius: 5px;
        font-family: monospace;
        margin-block-start: 0px;
        margin-block-end: 0px;
    }

    .terminal input {
        margin: 10px;
        padding: 0;
        background-color: inherit;
        color: inherit;
        font-family: inherit;

    }

    .grn-border {
        border: 1px solid #FFB000;
    }

    h1, h3, h4 {
        color: darkblue;
    }

</style>