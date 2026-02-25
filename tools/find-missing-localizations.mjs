#!/usr/bin/env node

import MissingLocalizationChecker from "./localization-checker/missing-keys.mjs";
import { createLocalizationCliConfig } from "./localization-checker/cli-config.mjs";

// Parse command line arguments
const argv = createLocalizationCliConfig();

// Run the localization checker
const checker = new MissingLocalizationChecker( {
  modulesDir:   argv.moduleDir,
  templatesDir: argv.templatesDir,
  langDir:      argv.langDir,
  outputFile:   argv.outputFile,
  verbose:      argv.verbose
} );

checker.run()
  .catch( error => {
    console.error( "Error running localization checker:", error );
    process.exit( 1 );
  } );
