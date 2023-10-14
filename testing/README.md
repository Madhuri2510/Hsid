# Test Automation Onboarding

## Automation Tools Used

- [Homebrew Package Manager](https://brew.sh/)
- [Yarn/Node Package Manager via Brew](https://formulae.brew.sh/formula/node) or [Manual Download](https://nodejs.org/en/download/)
- [Android Studio + ADB](https://developer.android.com/studio)
- [Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12)
- [Visual Studio Code](https://code.visualstudio.com/)
- [CodeceptJS using Javascript](https://codecept.io/basics/)
- [Detox](https://github.com/wix/Detox)
- [Appium](http://appium.io/docs/en/drivers/ios-xcuitest/index.html)
- [Zephyr Test Case Manager](https://dish.yourzephyr.com/flex/html5/tcr/624)

## Repo Layout

When working on tests it is important to understand where the differenet components are present. Codecept, the framework we are using, has a [specific breakdown of component types that are used to write tests](https://codecept.io/helpers/).

- *Helpers*: Interaction with lower level APIs. We use this to wrap around Detox and Appium functionality. [^1]
  - **Located At: '[./helpers](./helpers)'**
- *Page Objects*: Following along with the [Page Object Model](https://martinfowler.com/bliki/PageObject.html), Page objects wrap around functionality and flows of a given page in the application. These page objects are in charge of navigating and interacting with certain components of the page. [^2]
  - **Located At: '[./pages](./pages)'**
- *Utility Functions*: for shared functionality, such as general ribbon navigation, are present within this file.
  - **Located At: '[./pages/CommonUtil](./pages/CommonUtil)'**
- *Test Environment Configuration*: User accounts and other preferences
  - **Located At: '[./config](./config)'**
- *Test Case Scripts*: (Organized by Page/Feature) start with the feature/page name and end with '_test.js'
  - **Located At: '[./testcases](./testcases)'**
- *Platform Configuration*: These define which Helpers and PageObjects to use when running the suite for the given platform. It also provides Codecept with startup/teardown utilities and other configurations around the test runner.
  - **Located At: './codecept.PLATFORM.js'**
- *Device Configuration*: This is where you add information about how to locate the APK/IPA that will be used to test on the given device chosen by a device identifier/name.
  - **Located At: '[./device.conf.json](./device.conf.json)'**
- *Test Run Artifacts*: When tests run, they may generate screenshots and/or other resources. All of these files will be stored in this directory
  - **Located At: '[./artifacts](./artifacts)'**
- *Repo Commands*: The commands to run the test suite are located in the package.json file located at the root of the 'testing' folder as well as the monorepo root.
  - **Located At: [./package.json](./package.json) and [../package.json](../package.json)**

## Setting Up Environment

It's advised that you follow both this setup and the setup present in the [README.md](../README.md) that developers use and reference. There is important information omitted from this README that is present in the other, including but not limited to: Installing Yarn Package Manager.

### Android Setup

Please follow the offical [React Native guide](https://reactnative.dev/docs/environment-setup) to setting up Android development to start working. Once you have done that, you can continue off here.
I assume you have already downloaded the installer for Android Studio and have started the installation process. Once done you will to start an empty project and access the Android Virtual Device manager menu and create a few emulators. Currently the codecept configuration references two emulators: Android TV 720p @ API 29 and Android TV 1080p @ API 29.

In the case where your version of Java isn't the correct one (You should be on Java 1.8) you will need to install Java 1.8 and set your JAVA_HOME variable to point to it. Gradle will throw odd errors and fail to build/clean unless you are using Java 1.8.

You can check your Java version by running this command:

```shell
java -version 
```

You can install Java 1.8 via Brew with the following commands:

```shell
brew tap AdoptOpenJDK/openjdk
brew install --cask adoptopenjdk8 
```

Once you have Java 1.8 installed, you will need to make sure your JAVA_HOME variable points to the correct location. In order to do this, I have added the following line to my `~/.zprofile` or `~/.bash_profile` (depending on which shell you are using). This may change based on MacOS versions and doing some googling may point you to a more up-to-date solution for setting this variable.

```shell
export JAVA_HOME="/Library/Java/JavaVirtualMachines/adoptopenjdk-8.jdk/Contents/Home"
```

Please make sure you have gradle configured to allow for grabbing artifacts from Artifactory. You will need credentials for artifactory and such. Information about this configuration step is present in the [README.md](../README.md) present in the monorepo root: section *'Android'*

Once you have Android Studio and everything installed, you will need to make sure you have all the appropriate packages installed to build and run the code. You can do this by following the section in the [README.md](../README.md) present in the monorepo root: section *'Installing dependencies with one command'*

### Apple Setup

Please follow the guide for setting up [React Native for iOS development](https://reactnative.dev/docs/environment-setup#target-os). It includes a lot of information and installing a required tool for building Apple targeted apps: Cocoapods.

Once you have that all working, follow the instructions under the section: *'Installing dependencies with one command'* in the [README.md](../README.md) present at the root of the mono-repo.

## Building The App For Testing

### Android

Detox, which is used for testing on Android, requires the app to be instrumented for testing. To build the app for testing, run `yarn detox-build` from the `testing` folder root. This will run gradle and build the app for testing as well as print out where it stored has the APKs/artifacts.

### Apple

TBD

## Preparing Automation

First thing you will want to do is look at the [testing/package.json]('./package.json') as well as [$ROOT/package.json]('../package.json') and see which scripts/commands are available to run the automation suite. Most of the scripts that are used to run the automation start with `codecept-`. Currently the main one that works is `yarn codecept-tv` from the root that calls `ten-foot start` which starts up the Metro/RN server for running the application on ten-foot devices and `testing codecept-run-android-tv` which runs the [android TV config]('./codecept.androidTV.conf.js'). 

The first step is to make sure the config is running the test scenarios you want it to. When you are writing tests, you will likely want to change the `tests` field to point to only the test suite you are working on: `tests: './testcases/MY_SUITE_test.js',`.

Once you have it pointing to the tests you want to run, make sure that the `helpers` are all configured properly. Currently we use Detox and a custom DpadNav helper for Android. As long as you don't rename or add new helpers you should be fine, but if you need to write new helpers check out the footnotes for the Codecept Helper Objects documentation link. Check to make sure that the Detox helper is set to run on the device you want it to. This can be adjusted by changing the value of the `configuration` field within the Detox configuration. The configurations used here are present in the [device.conf.json]('./device.conf.json') file. Usually you'll want to adjust this to make sure it references your Android emulator or a physicaly connected device.

Also check that the `include` property has all associate Page Objects and their associated instance name that will be used in the scripts. `my_page_object: 'RELATIVE_PATH_TO_PAGE_OBJECT.js'`

## Running Automation

Once you have everything configured and you want to run the automation on the emulator/device you will need to run the command and let the app download the full JS bundle. Once you see the login/landing page you should be ready to run the Automation (note: This may change in the future as we get Metro server to run alongside the Codecept test runner).

Now that the App is installed, you should be able to run one of the `codecept-` commands, e.g. `yarn codecept-run-android-tv` from the root of the Monorepo.

If you run into problems with tests not running because the app doesn't seem to start up try resetting your Android emulator device cache or by doing a full uninstall/reinstall of the app and re-initializing the app.

## Writing Automation

First things first you will want to make sure you have an associated test case in the [Zephyr Test Case Manager](https://dish.yourzephyr.com/flex/html5/tcr/624). This will allow us to more easily keep track of what tests are and are not automated. Make sure that the test case has an associated alternate ID, usually in the format of FEATURE_PAGE_NAME:GUID. This will allow us to more easily keep track of associated test runs when we create new releases in Zephyr.

Once you have a test to write, check out [CodeceptJS's official documentation](https://codecept.io/basics/) for how the SCENARIO, FEATURE, and other callbacks are set up. Each test case should be associated with one SCENARIO hook.

If you need to debug your tests, you can attach a debug terminal in VSCode by opening the command pallet (CMD + SHIFT + P) and use the command `DEBUG: Create Javascript Debug Terminal` and launching the `yarn codecept-run-android-tv` from that debug terminal. You can read CodeceptJS's write up about debugging tests [here](https://codecept.io/advanced/#debug). Once the debugger is attached, you can create breakpoints in your test scenarios in VSCode and run commands via the console just like LLDB/GDB by using Javascript functions.

## Common Issues + Resolutions

## Footnotes

[^1]: Codecept Helper Objects: <https://codecept.io/helpers/>

[^2]: Codecept Page Objects: <https://codecept.io/pageobjects/>
