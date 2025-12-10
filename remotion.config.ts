import { Config } from '@remotion/cli/config';

/**
 * Remotion Configuration
 * This file configures Remotion for video rendering
 */

Config.setConcurrency(4);
Config.setLevel('info');

export default Config;
