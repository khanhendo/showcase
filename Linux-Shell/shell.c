#include <ctype.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#define NORMAL 0
#define NEWLINE 1
#define NULLBYTE 2
#define MAX_LEN 10

/* Shell Project - Khan Henderson
Includes basic assignment and extra features: redirect (< and >) */

char *get_token(char **s, int *status) {
    // Advance thru initial white space
    while (isspace(**s) != 0 && **s != '\n') {
        (*s)++;
    }

    // Assign status
    if (*s[0] == '\0') {
        *status = NULLBYTE;
        return NULL;
    }
    if (*s[0] == '\n') {
        *status = NEWLINE;
        return NULL;
    }
    *status = NORMAL;

    // New array
    char *tok = (char *)malloc(80);
    for (int i = 0; isspace(*s[0]) == 0; i++) {
        tok[i] = *s[0];
        (*s)++;
    }
    return tok;
}

void execShell(char **arr, char **envp) {
    int ret;
    if ((ret = execve(arr[0], arr, envp)) < 0) {
        perror("execve");
    }
}

/* Adjust file descriptors for redirection before exec.
After exec, return to standard input / standard output. */ 
void execLine(char **arr, char **envp, int *redir) {
    if (!strcmp(arr[0], "exit")) { // exits shell
        printf("Exiting...\n");
        exit(0);
    }
    if (!strcmp(arr[0], "cd")) { // cd system call shouldn't be in subprocess, to maintain changed dir.
        chdir(arr[1]);
        return;
    }
    pid_t c1; // child1
    int ret;
    if ((c1 = fork()) < 0) {
        printf("fork() FAILED");
        perror("forkeg");
        _exit(1);
    }
    if ((!c1)) { // child1
        if (redir[0] == -1 && redir[1] == -1) {
            execShell(arr, envp);
        } else { // when there are redir (< or >)
            int in, out, fd, std_in, std_out;
            char **exeArr = (char **)malloc(sizeof(char *) * MAX_LEN);
            if ((in = redir[0]) > -1) {
                if ((std_in = dup(0)) < 0) {
                    perror("dup()");
                    _exit(-1);
                };
                close(0);
                if ((fd = open(arr[in], O_RDONLY)) < 0) {
                    perror("open");
                    dup2(std_in, 0);
                    _exit(-1);
                }
                for (int i = 0; i < in - 1; i++) {
                    exeArr[i] = arr[i];
                }
            } else {
                for (int i = 0; i < redir[1] - 1; i++) {
                    exeArr[i] = arr[i];
                }
            }
            if ((out = redir[1]) > -1) {
                if ((std_out = dup(1)) < 0) {
                    perror("dup()");
                    _exit(-1);
                };
                close(1);
                if ((fd = open(arr[out], O_WRONLY | O_CREAT | O_TRUNC, 0777)) < 0) {
                    perror("open");
                    dup2(std_out, 1);
                    _exit(-1);
                }
            }
            // call exec, with arr only containing relavent arguments
            execShell(exeArr, envp);

            // Cleanup: bring back stdin and stdout 
            if (in > -1) {
                close(0);
                if ((fd = dup2(std_in, 0)) < 0) {
                    perror("dup2()");
                    _exit(-1);
                }
            }

            if (out > -1) {
                close(1);
                if ((fd = dup2(std_out, 1)) < 0) {
                    perror("dup2()");
                    _exit(-1);
                }
            }
            free(exeArr);
        }
        _exit(0);
    } else { // parent
        wait(NULL);
    }
}

/* User's prompt to input a command. 
Future feature, adjust to display open directory.*/
void inputPrompt() {
    printf("User $ ");
}

/* check for < redirection, 
if < exists, return index of first element after <. 
else, return -1 */
int checkRedirIn(char **arr) {
    int i = 1;
    while (arr[i] != (char *)0) {
        if (!strcmp(arr[i], "<")) {
            return i + 1;
        }
        i++;
    }
    return -1; // -1 indicates no redirection 
}

/* check for > output redirection, 
if > exists, return index of first element after >. 
else, return -1 */
int checkRedirOut(char **arr) {
    int i = 1;
    while (arr[i] != (char *)0) {
        if (!strcmp(arr[i], ">")) {
            return i + 1;
        }
        i++;
    }
    return -1; // -1 indicates no redirection 
}

int main(int argc, char **argv, char **envp) {
    int loop = 1;
    while (loop) {
        char *line = (char *)malloc(80);
        char *orig_line = line;
        size_t size = 80;
        int ret;
        inputPrompt();
        if ((ret = getline(&line, &size, stdin)) < 0) {
            perror("getline");
            return -1;
        }
        /* assert: input line stored in line[] */

        char *token;
        int status;

        char **arr = (char **)malloc(sizeof(char *) * MAX_LEN);
        token = get_token(&line, &status);
        int i;
        for (i = 0; token != NULL; i++) {
            if (i >= MAX_LEN - 1) {
                printf("Too many tokens! Ignoring further tokens.\n");
                token = NULL;
            } else {
                arr[i] = token;
                token = get_token(&line, &status);
            }
        }
        arr[i + 1] = (char *)0;

        // Extra features, parse input for < or >, and adjust accordingly 
        int redir[2];
        redir[0] = checkRedirIn(arr);
        redir[1] = checkRedirOut(arr);

        execLine(arr, envp, redir);

        // Cleanup: delete strings
        for (int i = 0; arr[i] != (char *)0; i++) {
            free(arr[i]);
        }
        free(orig_line);
        free(token);
    }
    return 0;
}
