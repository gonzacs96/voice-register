import { ClientSecretCredential } from '@azure/identity';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { VersionEnum } from 'src/dtos/query-upload-file.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { VideoIndexerService } from './video-indexer.service';
import { UnknownException } from 'src/exceptions/unknown.exception';

@Injectable()
export class VideoIndexerHttpService {
  constructor(private readonly httpService: HttpService, private readonly configService: ConfigService) {}

  private readonly logger = new Logger(VideoIndexerService.name);

  private readonly baseUrl = 'https://api.videoindexer.ai';

  private readonly tenantId = this.configService.get('AZURE_TENANT_ID');

  private readonly azureClientId = this.configService.get('AZURE_CLIENT_ID');

  private readonly azureClientSecret = this.configService.get('AZURE_CLIENT_SECRET');

  private readonly suscriptionKey = this.configService.get('SUSCRIPTION_KEY');

  private readonly location = this.configService.get('VI_LOCATION');

  private readonly accountId = this.configService.get('ACCOUNT_ID');

  private readonly locationTrial = this.configService.get('VI_LOCATION_TRIAL');

  private readonly accountIdTrial = this.configService.get('ACCOUNT_ID_TRIAL');

  private readonly suscriptionId = this.configService.get('SUBSCRIPTION_ID');

  private readonly azureResourceManager = 'https://management.azure.com';

  private readonly resourceGroup = this.configService.get('VI_RESOURCE_GROUP');

  private readonly accountName = this.configService.get('VI_ACCOUNT_NAME');

  private readonly apiVersion = '2022-07-20-preview';

  async getHttpService(version: VersionEnum) {
    return version === VersionEnum.TRIAL ? await this.trialInstance() : await this.paidInstance();
  }

  private async trialInstance() {
    return new HttpService(
      axios.create({
        baseURL: `${this.baseUrl}/${this.locationTrial}/Accounts/${this.accountIdTrial}/`,
        params: { accessToken: await this.getTrialToken() },
        headers: { 'Ocp-Apim-Subscription-Key': this.suscriptionKey },
      }),
    );
  }

  private async paidInstance() {
    return new HttpService(
      axios.create({
        baseURL: `${this.baseUrl}/${this.location}/Accounts/${this.accountId}/`,
        params: { accessToken: await this.getPaidToken() },
        headers: { 'Ocp-Apim-Subscription-Key': this.suscriptionKey },
      }),
    );
  }

  private async getPaidToken() {
    const defaultCredential = new ClientSecretCredential(
      this.tenantId,
      this.azureClientId,
      this.azureClientSecret,
    );
    const { token } = await defaultCredential.getToken(`${this.azureResourceManager}/.default`);
    const requestUri = `${this.azureResourceManager}/subscriptions/${this.suscriptionId}/resourcegroups/${this.resourceGroup}/providers/Microsoft.VideoIndexer/accounts/${this.accountName}/generateAccessToken?api-version=${this.apiVersion}`;
    const requestBody = { permissionType: 'Contributor', scope: 'Account' };
    const getVideoIndexerAccesToken = await firstValueFrom(
      this.httpService
        .post(requestUri, requestBody, { headers: { Authorization: `Bearer ${token}` } })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new UnknownException('An error happened with getTokenArm');
          }),
        ),
    );
    return getVideoIndexerAccesToken.data.accessToken;
  }

  private async getTrialToken() {
    const url = `${this.baseUrl}/Auth/${this.locationTrial}/Accounts/${this.accountIdTrial}/AccessToken`;
    const parameters = { location: this.location, allowEdit: true };
    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(url, {
          headers: { 'Ocp-Apim-Subscription-Key': this.suscriptionKey },
          params: parameters,
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw new UnknownException('An error happened with get token video indexer api');
          }),
        ),
    );
    return data;
  }
}
