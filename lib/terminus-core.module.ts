import {
  DynamicModule,
  Global,
  Module,
  Provider,
  HttpModule,
} from '@nestjs/common';
import {
  TerminusModuleOptions,
  TerminusModuleAsyncOptions,
  TerminusOptionsFactory,
} from './interfaces';
import { TERMINUS_MODULE_OPTIONS } from './terminus.constants';
import { TerminusBootstrapService } from './terminus-bootstrap.service';
import { TerminusLibProvider } from './terminus-lib.provider';
import { TerminusModule } from './terminus.module';
import { TypeOrmHealthIndicator, MongooseHealthIndicator } from '.';
import {
  DNSHealthIndicator,
  MicroserviceHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from './health-indicators';
import { DiskusageLibProvider } from './health-indicators/disk/diskusage-lib.provider';

/**
 * The internal Terminus Module which handles the integration
 * with the third party Terminus library and Nest
 *
 * @internal
 */
@Global()
@Module({
  providers: [TerminusLibProvider, TerminusBootstrapService],
  exports: [],
})
export class TerminusCoreModule {
  /**
   * Bootstraps the internal Terminus Module with the given options
   * synchronously and sets the correct providers
   * @param options The options to bootstrap the module synchronously
   */
  static forRoot(options: TerminusModuleOptions): DynamicModule {
    const terminusModuleOptions = {
      provide: TERMINUS_MODULE_OPTIONS,
      useValue: options,
    };

    return {
      module: TerminusCoreModule,
      imports: [HttpModule],
      providers: [
        terminusModuleOptions,
        TerminusLibProvider,
        TerminusBootstrapService,
        TypeOrmHealthIndicator,
        MongooseHealthIndicator,
        MicroserviceHealthIndicator,
        DiskusageLibProvider,
        DiskHealthIndicator,
        MemoryHealthIndicator,
      ],
      exports: [
        TypeOrmHealthIndicator,
        MongooseHealthIndicator,
        DNSHealthIndicator,
        MicroserviceHealthIndicator,
        DiskHealthIndicator,
        MemoryHealthIndicator,
      ],
    };
  }

  /**
   * Bootstraps the internal Terminus Module with the given
   * options asynchronously and sets the correct providers
   * @param options The options to bootstrap the module
   */
  static forRootAsync(options: TerminusModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: TerminusModule,
      imports: [...(options.imports || []), HttpModule],
      providers: [
        ...asyncProviders,
        TerminusBootstrapService,
        TerminusLibProvider,
        TypeOrmHealthIndicator,
        DNSHealthIndicator,
        MongooseHealthIndicator,
        MicroserviceHealthIndicator,
        DiskusageLibProvider,
        DiskHealthIndicator,
        MemoryHealthIndicator,
      ],
      exports: [
        TypeOrmHealthIndicator,
        DNSHealthIndicator,
        MongooseHealthIndicator,
        MicroserviceHealthIndicator,
        DiskHealthIndicator,
        MemoryHealthIndicator,
      ],
    };
  }

  /**
   * Returns the asynchrnous providers depending on the given module
   * options
   * @param options Options for the asynchrnous terminus module
   */
  private static createAsyncProviders(
    options: TerminusModuleAsyncOptions,
  ): Provider[] {
    if (options.useFactory || options.useExisting) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
        inject: [options.inject || []],
      },
    ];
  }

  /**
   * Returns the asynchrnous Terminus options providers depending on the
   * given module options
   * @param options Options for the asynchrnous terminus module
   */
  private static createAsyncOptionsProvider(
    options: TerminusModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: TERMINUS_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: TERMINUS_MODULE_OPTIONS,
      useFactory: async (optionsFactory: TerminusOptionsFactory) =>
        await optionsFactory.createTerminusOptions(),
      inject: [options.useClass || options.useExisting],
    };
  }
}
