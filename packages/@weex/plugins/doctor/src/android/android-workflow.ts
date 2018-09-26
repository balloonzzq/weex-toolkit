import { Workflow, ValidationType, ValidationMessage, ValidationResult, DoctorValidator } from '../doctor';
import { kAndroidHome, androidSdk } from './android-sdk';

const licenseAccepted = new RegExp('All SDK package licenses accepted.');

enum LicensesAccepted {
  none,
  some,
  all,
  unknown,
}

export class AndroidWorkflow implements Workflow {
  get appliesToHostPlatform():boolean {
    return true;
  }
}

export const androidWorkflow = new AndroidWorkflow();

export class AndroidValidator implements DoctorValidator {
  public title: string;
  public messages: ValidationMessage[] = [];
  constructor() {
    this.title = 'Android toolchain - develop for Android devices';
  }

  public validate () {
    // android-sdk
    if (!androidSdk.directory) {
      // No Android SDK found.
      if (process.env[`${kAndroidHome}`]) {
        const androidHomeDir:string = process.env[`${kAndroidHome}`];
        this.messages.push(
          new ValidationMessage(
            `${kAndroidHome} = ${androidHomeDir}\n
            but Android SDK not found at this location.`,
            true /* isError */,
          ),
        )
      } else {
        this.messages.push(
          new ValidationMessage(
            `Unable to locate Android SDK.\n
            Install Android Studio from: https://developer.android.com/studio/index.html\n
            On first launch it will assist you in installing the Android SDK components.\n
            (or visit https://flutter.io/setup/#android-setup for detailed instructions).\n
            If Android SDK has been installed to a custom location, set \$ ${kAndroidHome} to that location.`,
            true /* isError */,
          ),
        )
      }
      return new ValidationResult(ValidationType.missing, this.messages);
    }

    this.messages.push(
      new ValidationMessage(
        `Android SDK at ${androidSdk.directory}`,
      ),
    );

    let sdkVersionText: string;
    if (androidSdk.latestVersion) {
      sdkVersionText = `Android SDK ${androidSdk.latestVersion.buildToolsVersionName}`;
      this.messages.push(
        new ValidationMessage(
          `Platform ${androidSdk.latestVersion.platformName}, build-tools ${androidSdk.latestVersion.buildToolsVersionName}`
        ),
      )
    }

    if (process.env[`${kAndroidHome}`]) {
      const androidHomeDir:string = process.env[`${kAndroidHome}`];
      this.messages.push(
        new ValidationMessage(
          `${kAndroidHome} = ${androidHomeDir}\n`
        ),
      )
    }

    const validationResult = androidSdk.validateSdkWellFormed();

    if (validationResult.length) {
      // Android SDK is not functional.
      validationResult.forEach(message => {
        this.messages.push(
          new ValidationMessage(
            message,
            true /* isError */,
          ),
        );
      });
      this.messages.push(
        new ValidationMessage(
          `Try re-installing or updating your Android SDK,\n
          visit https://flutter.io/setup/#android-setup for detailed instructions.`
        ),
      );
      return new ValidationResult(ValidationType.partial, this.messages, sdkVersionText)
    }

    // Now check for the JDK.
    // const javaBinary = AndroidSdk.findJavaBinary();

    // Check JDK version.

    // Check for licenses.

    // Success.
    return new ValidationResult(ValidationType.installed, this.messages, sdkVersionText);
  }

  public licensesAccepted() {
    let status: LicensesAccepted;
  }

}

export const androidValidator = new AndroidValidator();