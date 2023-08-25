/**
 * Created by ahmet.basgoze on 8/23/2023.
 */

document.addEventListener("DOMContentLoaded", function() {
    // Function to retrieve and display high scores
    function displayHighScores() {
        const bestScoresList = document.getElementById("best-scores-list");
        const highScores = JSON.parse(localStorage.getItem("highScores")) || [];

        // Display high scores in the list
        for (let i=0; i<30; i++) {
            const entry = highScores[i];
            const listItem = document.createElement("li");
            listItem.textContent = `${entry.name}: ${entry.score}`;
            bestScoresList.appendChild(listItem);
        }
    }

    // Call the displayHighScores function when the page is loaded
    displayHighScores();
});
