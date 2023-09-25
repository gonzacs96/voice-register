import {
  BlobDeleteIfExistsResponse,
  BlobServiceClient,
  BlockBlobClient,
  BlockBlobUploadResponse,
  ContainerSASPermissions,
  SASProtocol,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AzstorageService {
  constructor(private readonly configService: ConfigService) {}

  private accountName = this.getFromConnectionString('AccountName');
  private accountKey = this.getFromConnectionString('AccountKey');
  private endpointSuffix = this.getFromConnectionString('EndpointSuffix');
  private defaultSasDuration = 600000;
  private get sharedKeyCredential() {
    return new StorageSharedKeyCredential(this.accountName, this.accountKey);
  }
  private get baseUrl() {
    return `https://${this.accountName}.blob.${this.endpointSuffix}`;
  }

  async upload(fileName: string, file: Buffer, containerName = 'files'): Promise<BlockBlobUploadResponse> {
    const blobClient = await this.getBlobClient(fileName, containerName);
    return await blobClient.upload(file, Buffer.byteLength(file));
  }

  async delete(fileId: string, containerName = 'files'): Promise<BlobDeleteIfExistsResponse> {
    const blobClient = await this.getBlobClient(fileId, containerName);
    return await blobClient.deleteIfExists({ deleteSnapshots: 'include' });
  }

  async get(fileId: string, containerName = 'files'): Promise<Buffer> {
    const blobClient = await this.getBlobClient(fileId, containerName);
    return await blobClient.downloadToBuffer();
  }

  async uploadAndGetUrl(
    fileName: string,
    buffer: Buffer,
    containerName: string,
    tokenDuration = this.defaultSasDuration,
  ): Promise<string> {
    await this.upload(fileName, buffer, containerName);
    return this.getSasUrl(fileName, containerName, tokenDuration);
  }

  getSasUrl(fileName: string, containerName: string, tokenDuration = this.defaultSasDuration): string {
    const sas = this.getSasToken(fileName, containerName, tokenDuration);
    return new URL(`/${containerName}/${fileName}?${sas}`, this.baseUrl).href;
  }

  private getSasToken(
    fileName: string,
    containerName: string,
    tokenDuration = this.defaultSasDuration,
  ): string {
    const errorOffset = 900000;
    const containerSAS = generateBlobSASQueryParameters(
      {
        containerName,
        blobName: fileName,
        permissions: ContainerSASPermissions.parse('r'),
        startsOn: new Date(new Date().valueOf() - errorOffset),
        expiresOn: new Date(new Date().valueOf() + tokenDuration),
        protocol: SASProtocol.HttpsAndHttp,
      },
      this.sharedKeyCredential,
    ).toString();
    return containerSAS;
  }

  private async getBlobClient(fileName: string, containerName: string): Promise<BlockBlobClient> {
    const blobClientService = BlobServiceClient.fromConnectionString(
      this.configService.get('AZURE_STORAGE_CONNSTRING'),
    );
    const containerClient = blobClientService.getContainerClient(containerName);
    await containerClient.createIfNotExists();
    const blobClient = containerClient.getBlockBlobClient(fileName);
    return blobClient;
  }

  private getFromConnectionString(propertyName: 'AccountName' | 'AccountKey' | 'EndpointSuffix'): string {
    const connectionString: string = this.configService.get('AZURE_STORAGE_CONNSTRING');
    const init = `${propertyName}=`;
    const property = connectionString.split(';').find((property) => property.startsWith(init));
    return property.substring(init.length);
  }
}
