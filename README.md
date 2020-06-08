## About

This project demonstrates the use of Electron in conjunction with a React app created through CRA typescript template. The objective is to have a desktop version of a CRA app, which could be configured to have both online and offline capabilities in the long run (though I'm not going to demonstrate how to enable this behaviour in this example).

I'll opt for a single instance app, but that's easily configurable by removing the lines related to it.

## Global Dependencies

This project requires [Node](https://nodejs.org/en/download/package-manager) and [Yarn](https://yarnpkg.com/en/docs/install) installed in your system.

I use [Visual Studio Code](https://code.visualstudio.com) as my preferred code editor.

## Clone and Preview

In a terminal, clone the project and access its root folder:

```
git clone https://github.com/jobsonita/test-electron-react-cra-integration.git
cd test-electron-react-cra-integration
```

At the root of the project, run:

```
yarn
yarn start
```

With a second terminal at the root of the project, run:

```
yarn start-electron
```

## Build and Install

With a terminal open at the root of the project, run:

`Unix`:
```
yarn package
```

`Windows`:
```
yarn package-win
```

Open the generated dist folder and look for the installer for your system (.exe for Windows, .deb for Linux/Ubuntu, .dmg for MacOS).

## Steps to reproduce this project

This project uses these articles as references:
- [Building a production electron/create-react-app application with shared code using electron-builder](https://medium.com/@johndyer24/building-a-production-electron-create-react-app-application-with-shared-code-using-electron-builder-c1f70f0e2649)
- [Desktop application with Electron & React (CRA)](https://dev.to/iampikai/desktop-application-with-electron-react-cra-3ooi)

Follow the steps below to reproduce the creation of this app:

```
yarn create react-app test-electron-react-cra-integration --template typescript
```

Access the folder and open the project in VS Code:

```
cd test-electron-react-cra-integration
code .
```
