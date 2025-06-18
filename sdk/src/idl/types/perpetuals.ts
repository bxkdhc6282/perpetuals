/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/perpetuals.json`.
 */
export type Perpetuals = {
  address: '';
  metadata: {
    name: 'perpetuals';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Solana Perpetuals Exchange';
    repository: 'https://github.com/solana-labs/perpetuals';
  };
  instructions: [
    {
      name: 'addCollateral';
      discriminator: [127, 82, 121, 42, 161, 176, 249, 206];
      accounts: [
        {
          name: 'owner';
          writable: true;
          signer: true;
          relations: ['fundingAccount', 'position'];
        },
        {
          name: 'fundingAccount';
          writable: true;
        },
        {
          name: 'transferAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'position';
          writable: true;
        },
        {
          name: 'custody';
          writable: true;
        },
        {
          name: 'custodyOracleAccount';
        },
        {
          name: 'custodyTwapAccount';
          optional: true;
        },
        {
          name: 'collateralCustody';
          writable: true;
        },
        {
          name: 'collateralCustodyOracleAccount';
        },
        {
          name: 'collateralCustodyTwapAccount';
          optional: true;
        },
        {
          name: 'collateralCustodyTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  99,
                  117,
                  115,
                  116,
                  111,
                  100,
                  121,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                ];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'collateral_custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'addCollateralParams';
            };
          };
        },
      ];
    },
    {
      name: 'addCustody';
      discriminator: [247, 254, 126, 17, 26, 6, 215, 117];
      accounts: [
        {
          name: 'admin';
          writable: true;
          signer: true;
        },
        {
          name: 'multisig';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 117, 108, 116, 105, 115, 105, 103];
              },
            ];
          };
        },
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          writable: true;
        },
        {
          name: 'custody';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custodyTokenMint';
              },
            ];
          };
        },
        {
          name: 'transferAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'custodyTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  99,
                  117,
                  115,
                  116,
                  111,
                  100,
                  121,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                ];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custodyTokenMint';
              },
            ];
          };
        },
        {
          name: 'custodyTokenMint';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'rent';
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'addCustodyParams';
            };
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'addCustodyInit';
      docs: [
        'THIS IS MEANT TO BE USED WITH ADD CUSTODY INSTRUCTION',
        'ADD IN SAME TRANSACTION ONLY',
      ];
      discriminator: [147, 67, 217, 189, 19, 190, 190, 24];
      accounts: [
        {
          name: 'admin';
          writable: true;
          signer: true;
        },
        {
          name: 'multisig';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 117, 108, 116, 105, 115, 105, 103];
              },
            ];
          };
        },
        {
          name: 'pool';
          writable: true;
        },
        {
          name: 'custody';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custodyTokenMint';
              },
            ];
          };
        },
        {
          name: 'custodyTokenMint';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'rent';
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'addCustodyInitParams';
            };
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'addLiquidity';
      discriminator: [181, 157, 89, 67, 143, 182, 52, 72];
      accounts: [
        {
          name: 'owner';
          writable: true;
          signer: true;
          relations: ['fundingAccount', 'lpTokenAccount'];
        },
        {
          name: 'fundingAccount';
          writable: true;
        },
        {
          name: 'lpTokenAccount';
          writable: true;
        },
        {
          name: 'transferAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'custody';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'custodyOracleAccount';
        },
        {
          name: 'custodyTwapAccount';
          optional: true;
        },
        {
          name: 'custodyTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  99,
                  117,
                  115,
                  116,
                  111,
                  100,
                  121,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                ];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'lpTokenMint';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [108, 112, 95, 116, 111, 107, 101, 110, 95, 109, 105, 110, 116];
              },
              {
                kind: 'account';
                path: 'pool';
              },
            ];
          };
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'addLiquidityParams';
            };
          };
        },
      ];
    },
    {
      name: 'addPool';
      discriminator: [115, 230, 212, 211, 175, 49, 39, 169];
      accounts: [
        {
          name: 'admin';
          writable: true;
          signer: true;
        },
        {
          name: 'multisig';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 117, 108, 116, 105, 115, 105, 103];
              },
            ];
          };
        },
        {
          name: 'transferAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'perpetuals';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'arg';
                path: 'params.name';
              },
            ];
          };
        },
        {
          name: 'lpTokenMint';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [108, 112, 95, 116, 111, 107, 101, 110, 95, 109, 105, 110, 116];
              },
              {
                kind: 'account';
                path: 'pool';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'rent';
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'addPoolParams';
            };
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'closePosition';
      discriminator: [123, 134, 81, 0, 49, 68, 98, 98];
      accounts: [
        {
          name: 'owner';
          writable: true;
          signer: true;
          relations: ['receivingAccount', 'position'];
        },
        {
          name: 'receivingAccount';
          writable: true;
        },
        {
          name: 'transferAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'position';
          writable: true;
        },
        {
          name: 'custody';
          writable: true;
        },
        {
          name: 'custodyOracleAccount';
        },
        {
          name: 'custodyTwapAccount';
          optional: true;
        },
        {
          name: 'collateralCustody';
          writable: true;
        },
        {
          name: 'collateralCustodyOracleAccount';
        },
        {
          name: 'collateralCustodyTwapAccount';
          optional: true;
        },
        {
          name: 'collateralCustodyTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  99,
                  117,
                  115,
                  116,
                  111,
                  100,
                  121,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                ];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'collateral_custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'closePositionParams';
            };
          };
        },
      ];
    },
    {
      name: 'getAddLiquidityAmountAndFee';
      discriminator: [172, 150, 249, 181, 233, 241, 78, 139];
      accounts: [
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'custody';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'custodyOracleAccount';
        },
        {
          name: 'custodyTwapAccount';
          optional: true;
        },
        {
          name: 'lpTokenMint';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [108, 112, 95, 116, 111, 107, 101, 110, 95, 109, 105, 110, 116];
              },
              {
                kind: 'account';
                path: 'pool';
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'getAddLiquidityAmountAndFeeParams';
            };
          };
        },
      ];
      returns: {
        defined: {
          name: 'amountAndFee';
        };
      };
    },
    {
      name: 'getAssetsUnderManagement';
      discriminator: [44, 3, 161, 69, 174, 75, 137, 162];
      accounts: [
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'getAssetsUnderManagementParams';
            };
          };
        },
      ];
      returns: 'u128';
    },
    {
      name: 'getEntryPriceAndFee';
      discriminator: [134, 30, 231, 199, 83, 72, 27, 99];
      accounts: [
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'custody';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'custodyOracleAccount';
        },
        {
          name: 'custodyTwapAccount';
          optional: true;
        },
        {
          name: 'collateralCustody';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'collateral_custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'collateralCustodyOracleAccount';
        },
        {
          name: 'collateralCustodyTwapAccount';
          optional: true;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'getEntryPriceAndFeeParams';
            };
          };
        },
      ];
      returns: {
        defined: {
          name: 'newPositionPricesAndFee';
        };
      };
    },
    {
      name: 'getExitPriceAndFee';
      discriminator: [73, 77, 94, 31, 8, 9, 92, 32];
      accounts: [
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'position';
        },
        {
          name: 'custody';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'custodyOracleAccount';
        },
        {
          name: 'custodyTwapAccount';
          optional: true;
        },
        {
          name: 'collateralCustody';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'collateral_custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'collateralCustodyOracleAccount';
        },
        {
          name: 'collateralCustodyTwapAccount';
          optional: true;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'getExitPriceAndFeeParams';
            };
          };
        },
      ];
      returns: {
        defined: {
          name: 'priceAndFee';
        };
      };
    },
    {
      name: 'getLiquidationPrice';
      discriminator: [73, 174, 119, 65, 149, 5, 73, 239];
      accounts: [
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'position';
        },
        {
          name: 'custody';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'custodyOracleAccount';
        },
        {
          name: 'custodyTwapAccount';
          optional: true;
        },
        {
          name: 'collateralCustody';
        },
        {
          name: 'collateralCustodyOracleAccount';
        },
        {
          name: 'collateralCustodyTwapAccount';
          optional: true;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'getLiquidationPriceParams';
            };
          };
        },
      ];
      returns: 'u64';
    },
    {
      name: 'getLiquidationState';
      discriminator: [127, 126, 199, 117, 90, 89, 29, 50];
      accounts: [
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'position';
        },
        {
          name: 'custody';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'custodyOracleAccount';
        },
        {
          name: 'custodyTwapAccount';
          optional: true;
        },
        {
          name: 'collateralCustody';
        },
        {
          name: 'collateralCustodyOracleAccount';
        },
        {
          name: 'collateralCustodyTwapAccount';
          optional: true;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'getLiquidationStateParams';
            };
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'getLpTokenPrice';
      discriminator: [71, 172, 21, 25, 176, 168, 60, 10];
      accounts: [
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'lpTokenMint';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [108, 112, 95, 116, 111, 107, 101, 110, 95, 109, 105, 110, 116];
              },
              {
                kind: 'account';
                path: 'pool';
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'getLpTokenPriceParams';
            };
          };
        },
      ];
      returns: 'u64';
    },
    {
      name: 'getOraclePrice';
      discriminator: [200, 20, 0, 106, 56, 210, 230, 140];
      accounts: [
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'custody';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'custodyOracleAccount';
        },
        {
          name: 'custodyTwapAccount';
          optional: true;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'getOraclePriceParams';
            };
          };
        },
      ];
      returns: 'u64';
    },
    {
      name: 'getPnl';
      discriminator: [106, 212, 3, 250, 195, 224, 64, 160];
      accounts: [
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'position';
        },
        {
          name: 'custody';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'custodyOracleAccount';
        },
        {
          name: 'custodyTwapAccount';
          optional: true;
        },
        {
          name: 'collateralCustody';
        },
        {
          name: 'collateralCustodyOracleAccount';
        },
        {
          name: 'collateralCustodyTwapAccount';
          optional: true;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'getPnlParams';
            };
          };
        },
      ];
      returns: {
        defined: {
          name: 'profitAndLoss';
        };
      };
    },
    {
      name: 'getRemoveLiquidityAmountAndFee';
      discriminator: [194, 226, 233, 102, 14, 21, 196, 7];
      accounts: [
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'custody';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'custodyOracleAccount';
        },
        {
          name: 'custodyTwapAccount';
          optional: true;
        },
        {
          name: 'lpTokenMint';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [108, 112, 95, 116, 111, 107, 101, 110, 95, 109, 105, 110, 116];
              },
              {
                kind: 'account';
                path: 'pool';
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'getRemoveLiquidityAmountAndFeeParams';
            };
          };
        },
      ];
      returns: {
        defined: {
          name: 'amountAndFee';
        };
      };
    },
    {
      name: 'getSwapAmountAndFees';
      discriminator: [247, 121, 40, 99, 35, 82, 100, 32];
      accounts: [
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'receivingCustody';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'receiving_custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'receivingCustodyOracleAccount';
        },
        {
          name: 'receivingCustodyTwapAccount';
          optional: true;
        },
        {
          name: 'dispensingCustody';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'dispensing_custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'dispensingCustodyOracleAccount';
        },
        {
          name: 'dispensingCustodyTwapAccount';
          optional: true;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'getSwapAmountAndFeesParams';
            };
          };
        },
      ];
      returns: {
        defined: {
          name: 'swapAmountAndFees';
        };
      };
    },
    {
      name: 'init';
      discriminator: [220, 59, 207, 236, 108, 250, 47, 100];
      accounts: [
        {
          name: 'upgradeAuthority';
          writable: true;
          signer: true;
        },
        {
          name: 'multisig';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 117, 108, 116, 105, 115, 105, 103];
              },
            ];
          };
        },
        {
          name: 'transferAuthority';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'perpetuals';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'perpetualsProgramData';
        },
        {
          name: 'perpetualsProgram';
          address: 'BCszwEzJUvTXCKyr7ko34z6TXWv4d8Wp9gEdFcHJpfX';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'initParams';
            };
          };
        },
      ];
    },
    {
      name: 'liquidate';
      discriminator: [223, 179, 226, 125, 48, 46, 39, 74];
      accounts: [
        {
          name: 'signer';
          writable: true;
          signer: true;
        },
        {
          name: 'receivingAccount';
          writable: true;
        },
        {
          name: 'rewardsReceivingAccount';
          writable: true;
        },
        {
          name: 'transferAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'position';
          writable: true;
        },
        {
          name: 'custody';
          writable: true;
        },
        {
          name: 'custodyOracleAccount';
        },
        {
          name: 'custodyTwapAccount';
          optional: true;
        },
        {
          name: 'collateralCustody';
          writable: true;
        },
        {
          name: 'collateralCustodyOracleAccount';
        },
        {
          name: 'collateralCustodyTwapAccount';
          optional: true;
        },
        {
          name: 'collateralCustodyTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  99,
                  117,
                  115,
                  116,
                  111,
                  100,
                  121,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                ];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'collateral_custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'liquidateParams';
            };
          };
        },
      ];
    },
    {
      name: 'openPosition';
      discriminator: [135, 128, 47, 77, 15, 152, 240, 49];
      accounts: [
        {
          name: 'owner';
          writable: true;
          signer: true;
          relations: ['fundingAccount'];
        },
        {
          name: 'fundingAccount';
          writable: true;
        },
        {
          name: 'transferAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'position';
          writable: true;
        },
        {
          name: 'custody';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'custodyOracleAccount';
        },
        {
          name: 'custodyTwapAccount';
          optional: true;
        },
        {
          name: 'collateralCustody';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'collateral_custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'collateralCustodyOracleAccount';
        },
        {
          name: 'collateralCustodyTwapAccount';
          optional: true;
        },
        {
          name: 'collateralCustodyTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  99,
                  117,
                  115,
                  116,
                  111,
                  100,
                  121,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                ];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'collateral_custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'openPositionParams';
            };
          };
        },
      ];
    },
    {
      name: 'removeCollateral';
      discriminator: [86, 222, 130, 86, 92, 20, 72, 65];
      accounts: [
        {
          name: 'owner';
          writable: true;
          signer: true;
          relations: ['receivingAccount', 'position'];
        },
        {
          name: 'receivingAccount';
          writable: true;
        },
        {
          name: 'transferAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'position';
          writable: true;
        },
        {
          name: 'custody';
          writable: true;
        },
        {
          name: 'custodyOracleAccount';
        },
        {
          name: 'custodyTwapAccount';
          optional: true;
        },
        {
          name: 'collateralCustody';
          writable: true;
        },
        {
          name: 'collateralCustodyOracleAccount';
        },
        {
          name: 'collateralCustodyTwapAccount';
          optional: true;
        },
        {
          name: 'collateralCustodyTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  99,
                  117,
                  115,
                  116,
                  111,
                  100,
                  121,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                ];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'collateral_custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'removeCollateralParams';
            };
          };
        },
      ];
    },
    {
      name: 'removeCustody';
      discriminator: [143, 229, 131, 48, 248, 212, 167, 185];
      accounts: [
        {
          name: 'admin';
          writable: true;
          signer: true;
        },
        {
          name: 'multisig';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 117, 108, 116, 105, 115, 105, 103];
              },
            ];
          };
        },
        {
          name: 'transferAuthority';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'custody';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'custodyTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  99,
                  117,
                  115,
                  116,
                  111,
                  100,
                  121,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                ];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'removeCustodyParams';
            };
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'removeLiquidity';
      discriminator: [80, 85, 209, 72, 24, 206, 177, 108];
      accounts: [
        {
          name: 'owner';
          writable: true;
          signer: true;
          relations: ['receivingAccount', 'lpTokenAccount'];
        },
        {
          name: 'receivingAccount';
          writable: true;
        },
        {
          name: 'lpTokenAccount';
          writable: true;
        },
        {
          name: 'transferAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'custody';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'custodyOracleAccount';
        },
        {
          name: 'custodyTwapAccount';
          optional: true;
        },
        {
          name: 'custodyTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  99,
                  117,
                  115,
                  116,
                  111,
                  100,
                  121,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                ];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'lpTokenMint';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [108, 112, 95, 116, 111, 107, 101, 110, 95, 109, 105, 110, 116];
              },
              {
                kind: 'account';
                path: 'pool';
              },
            ];
          };
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'removeLiquidityParams';
            };
          };
        },
      ];
    },
    {
      name: 'removePool';
      discriminator: [132, 42, 53, 138, 28, 220, 170, 55];
      accounts: [
        {
          name: 'admin';
          writable: true;
          signer: true;
        },
        {
          name: 'multisig';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 117, 108, 116, 105, 115, 105, 103];
              },
            ];
          };
        },
        {
          name: 'transferAuthority';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'perpetuals';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'removePoolParams';
            };
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'setAdminSigners';
      discriminator: [240, 171, 141, 105, 124, 2, 225, 188];
      accounts: [
        {
          name: 'admin';
          signer: true;
        },
        {
          name: 'multisig';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 117, 108, 116, 105, 115, 105, 103];
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'setAdminSignersParams';
            };
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'setCustodyConfig';
      discriminator: [133, 97, 130, 143, 215, 229, 36, 176];
      accounts: [
        {
          name: 'admin';
          signer: true;
        },
        {
          name: 'multisig';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 117, 108, 116, 105, 115, 105, 103];
              },
            ];
          };
        },
        {
          name: 'pool';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'custody';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'setCustodyConfigParams';
            };
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'setCustomOraclePrice';
      discriminator: [180, 194, 182, 63, 48, 125, 116, 136];
      accounts: [
        {
          name: 'admin';
          writable: true;
          signer: true;
        },
        {
          name: 'multisig';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 117, 108, 116, 105, 115, 105, 103];
              },
            ];
          };
        },
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'custody';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'oracleAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [111, 114, 97, 99, 108, 101, 95, 97, 99, 99, 111, 117, 110, 116];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'setCustomOraclePriceParams';
            };
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'setCustomOraclePricePermissionless';
      discriminator: [239, 43, 65, 148, 225, 133, 109, 156];
      accounts: [
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'custody';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'oracleAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [111, 114, 97, 99, 108, 101, 95, 97, 99, 99, 111, 117, 110, 116];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'ixSysvar';
          address: 'Sysvar1nstructions1111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'setCustomOraclePricePermissionlessParams';
            };
          };
        },
      ];
    },
    {
      name: 'setPermissions';
      discriminator: [214, 165, 105, 182, 213, 162, 212, 34];
      accounts: [
        {
          name: 'admin';
          signer: true;
        },
        {
          name: 'multisig';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 117, 108, 116, 105, 115, 105, 103];
              },
            ];
          };
        },
        {
          name: 'perpetuals';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'setPermissionsParams';
            };
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'setTestTime';
      discriminator: [242, 231, 177, 251, 126, 145, 159, 104];
      accounts: [
        {
          name: 'admin';
          signer: true;
        },
        {
          name: 'multisig';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 117, 108, 116, 105, 115, 105, 103];
              },
            ];
          };
        },
        {
          name: 'perpetuals';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'setTestTimeParams';
            };
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'swap';
      discriminator: [248, 198, 158, 145, 225, 117, 135, 200];
      accounts: [
        {
          name: 'owner';
          signer: true;
          relations: ['fundingAccount', 'receivingAccount'];
        },
        {
          name: 'fundingAccount';
          writable: true;
        },
        {
          name: 'receivingAccount';
          writable: true;
        },
        {
          name: 'transferAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'receivingCustody';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'receiving_custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'receivingCustodyOracleAccount';
        },
        {
          name: 'receivingCustodyTwapAccount';
          optional: true;
        },
        {
          name: 'receivingCustodyTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  99,
                  117,
                  115,
                  116,
                  111,
                  100,
                  121,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                ];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'receiving_custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'dispensingCustody';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'dispensing_custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'dispensingCustodyOracleAccount';
        },
        {
          name: 'dispensingCustodyTwapAccount';
          optional: true;
        },
        {
          name: 'dispensingCustodyTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  99,
                  117,
                  115,
                  116,
                  111,
                  100,
                  121,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                ];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'dispensing_custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'swapParams';
            };
          };
        },
      ];
    },
    {
      name: 'updatePoolAum';
      discriminator: [10, 125, 230, 234, 157, 184, 236, 241];
      accounts: [
        {
          name: 'payer';
          writable: true;
          signer: true;
        },
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
      ];
      args: [];
      returns: 'u128';
    },
    {
      name: 'upgradeCustody';
      discriminator: [23, 101, 146, 207, 189, 225, 229, 68];
      accounts: [
        {
          name: 'admin';
          writable: true;
          signer: true;
        },
        {
          name: 'multisig';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 117, 108, 116, 105, 115, 105, 103];
              },
            ];
          };
        },
        {
          name: 'pool';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'custody';
          writable: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'upgradeCustodyParams';
            };
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'withdrawFees';
      discriminator: [198, 212, 171, 109, 144, 215, 174, 89];
      accounts: [
        {
          name: 'admin';
          signer: true;
        },
        {
          name: 'multisig';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 117, 108, 116, 105, 115, 105, 103];
              },
            ];
          };
        },
        {
          name: 'transferAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'pool';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'pool.name';
                account: 'pool';
              },
            ];
          };
        },
        {
          name: 'custody';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 117, 115, 116, 111, 100, 121];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'custodyTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  99,
                  117,
                  115,
                  116,
                  111,
                  100,
                  121,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                ];
              },
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'account';
                path: 'custody.mint';
                account: 'custody';
              },
            ];
          };
        },
        {
          name: 'receivingTokenAccount';
          writable: true;
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'withdrawFeesParams';
            };
          };
        },
      ];
      returns: 'u8';
    },
    {
      name: 'withdrawSolFees';
      discriminator: [191, 53, 166, 97, 124, 212, 228, 219];
      accounts: [
        {
          name: 'admin';
          signer: true;
        },
        {
          name: 'multisig';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 117, 108, 116, 105, 115, 105, 103];
              },
            ];
          };
        },
        {
          name: 'transferAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'perpetuals';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 101, 114, 112, 101, 116, 117, 97, 108, 115];
              },
            ];
          };
        },
        {
          name: 'receivingAccount';
          writable: true;
        },
      ];
      args: [
        {
          name: 'params';
          type: {
            defined: {
              name: 'withdrawSolFeesParams';
            };
          };
        },
      ];
      returns: 'u8';
    },
  ];
  accounts: [
    {
      name: 'custody';
      discriminator: [1, 184, 48, 81, 93, 131, 63, 145];
    },
    {
      name: 'customOracle';
      discriminator: [227, 170, 164, 218, 127, 16, 35, 223];
    },
    {
      name: 'multisig';
      discriminator: [224, 116, 121, 186, 68, 161, 79, 236];
    },
    {
      name: 'perpetuals';
      discriminator: [28, 167, 98, 191, 104, 82, 108, 196];
    },
    {
      name: 'pool';
      discriminator: [241, 154, 109, 4, 17, 177, 109, 188];
    },
    {
      name: 'position';
      discriminator: [170, 188, 143, 228, 122, 64, 247, 208];
    },
    {
      name: 'priceUpdateV2';
      discriminator: [34, 241, 35, 99, 157, 126, 244, 205];
    },
    {
      name: 'twapUpdate';
      discriminator: [104, 192, 188, 72, 246, 166, 12, 81];
    },
  ];
  types: [
    {
      name: 'addCollateralParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'collateral';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'addCustodyInitParams';
      type: {
        kind: 'struct';
        fields: [];
      };
    },
    {
      name: 'addCustodyParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'isStable';
            type: 'bool';
          },
          {
            name: 'isVirtual';
            type: 'bool';
          },
          {
            name: 'oracle';
            type: {
              defined: {
                name: 'oracleParams';
              };
            };
          },
          {
            name: 'pricing';
            type: {
              defined: {
                name: 'pricingParams';
              };
            };
          },
          {
            name: 'permissions';
            type: {
              defined: {
                name: 'permissions';
              };
            };
          },
          {
            name: 'fees';
            type: {
              defined: {
                name: 'fees';
              };
            };
          },
          {
            name: 'borrowRate';
            type: {
              defined: {
                name: 'borrowRateParams';
              };
            };
          },
          {
            name: 'ratios';
            type: {
              vec: {
                defined: {
                  name: 'tokenRatios';
                };
              };
            };
          },
        ];
      };
    },
    {
      name: 'addLiquidityParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amountIn';
            type: 'u64';
          },
          {
            name: 'minLpAmountOut';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'addPoolParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'name';
            type: 'string';
          },
        ];
      };
    },
    {
      name: 'amountAndFee';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amount';
            type: 'u64';
          },
          {
            name: 'fee';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'assets';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'collateral';
            type: 'u64';
          },
          {
            name: 'protocolFees';
            type: 'u64';
          },
          {
            name: 'owned';
            type: 'u64';
          },
          {
            name: 'locked';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'borrowRateParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'baseRate';
            type: 'u64';
          },
          {
            name: 'slope1';
            type: 'u64';
          },
          {
            name: 'slope2';
            type: 'u64';
          },
          {
            name: 'optimalUtilization';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'borrowRateState';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'currentRate';
            type: 'u64';
          },
          {
            name: 'cumulativeInterest';
            type: 'u128';
          },
          {
            name: 'lastUpdate';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'closePositionParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'price';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'custody';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'pool';
            type: 'pubkey';
          },
          {
            name: 'mint';
            type: 'pubkey';
          },
          {
            name: 'tokenAccount';
            type: 'pubkey';
          },
          {
            name: 'decimals';
            type: 'u8';
          },
          {
            name: 'isStable';
            type: 'bool';
          },
          {
            name: 'isVirtual';
            type: 'bool';
          },
          {
            name: 'oracle';
            type: {
              defined: {
                name: 'oracleParams';
              };
            };
          },
          {
            name: 'pricing';
            type: {
              defined: {
                name: 'pricingParams';
              };
            };
          },
          {
            name: 'permissions';
            type: {
              defined: {
                name: 'permissions';
              };
            };
          },
          {
            name: 'fees';
            type: {
              defined: {
                name: 'fees';
              };
            };
          },
          {
            name: 'borrowRate';
            type: {
              defined: {
                name: 'borrowRateParams';
              };
            };
          },
          {
            name: 'assets';
            type: {
              defined: {
                name: 'assets';
              };
            };
          },
          {
            name: 'collectedFees';
            type: {
              defined: {
                name: 'feesStats';
              };
            };
          },
          {
            name: 'volumeStats';
            type: {
              defined: {
                name: 'volumeStats';
              };
            };
          },
          {
            name: 'tradeStats';
            type: {
              defined: {
                name: 'tradeStats';
              };
            };
          },
          {
            name: 'longPositions';
            type: {
              defined: {
                name: 'positionStats';
              };
            };
          },
          {
            name: 'shortPositions';
            type: {
              defined: {
                name: 'positionStats';
              };
            };
          },
          {
            name: 'borrowRateState';
            type: {
              defined: {
                name: 'borrowRateState';
              };
            };
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'tokenAccountBump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'customOracle';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'expo';
            type: 'i32';
          },
          {
            name: 'conf';
            type: 'u64';
          },
          {
            name: 'ema';
            type: 'u64';
          },
          {
            name: 'publishTime';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'fees';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'mode';
            type: {
              defined: {
                name: 'feesMode';
              };
            };
          },
          {
            name: 'ratioMult';
            type: 'u64';
          },
          {
            name: 'utilizationMult';
            type: 'u64';
          },
          {
            name: 'swapIn';
            type: 'u64';
          },
          {
            name: 'swapOut';
            type: 'u64';
          },
          {
            name: 'stableSwapIn';
            type: 'u64';
          },
          {
            name: 'stableSwapOut';
            type: 'u64';
          },
          {
            name: 'addLiquidity';
            type: 'u64';
          },
          {
            name: 'removeLiquidity';
            type: 'u64';
          },
          {
            name: 'openPosition';
            type: 'u64';
          },
          {
            name: 'closePosition';
            type: 'u64';
          },
          {
            name: 'liquidation';
            type: 'u64';
          },
          {
            name: 'protocolShare';
            type: 'u64';
          },
          {
            name: 'feeMax';
            type: 'u64';
          },
          {
            name: 'feeOptimal';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'feesMode';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'fixed';
          },
          {
            name: 'linear';
          },
          {
            name: 'optimal';
          },
        ];
      };
    },
    {
      name: 'feesStats';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'swapUsd';
            type: 'u64';
          },
          {
            name: 'addLiquidityUsd';
            type: 'u64';
          },
          {
            name: 'removeLiquidityUsd';
            type: 'u64';
          },
          {
            name: 'openPositionUsd';
            type: 'u64';
          },
          {
            name: 'closePositionUsd';
            type: 'u64';
          },
          {
            name: 'liquidationUsd';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'getAddLiquidityAmountAndFeeParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amountIn';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'getAssetsUnderManagementParams';
      type: {
        kind: 'struct';
        fields: [];
      };
    },
    {
      name: 'getEntryPriceAndFeeParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'collateral';
            type: 'u64';
          },
          {
            name: 'size';
            type: 'u64';
          },
          {
            name: 'side';
            type: {
              defined: {
                name: 'side';
              };
            };
          },
        ];
      };
    },
    {
      name: 'getExitPriceAndFeeParams';
      type: {
        kind: 'struct';
        fields: [];
      };
    },
    {
      name: 'getLiquidationPriceParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'addCollateral';
            type: 'u64';
          },
          {
            name: 'removeCollateral';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'getLiquidationStateParams';
      type: {
        kind: 'struct';
        fields: [];
      };
    },
    {
      name: 'getLpTokenPriceParams';
      type: {
        kind: 'struct';
        fields: [];
      };
    },
    {
      name: 'getOraclePriceParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'ema';
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'getPnlParams';
      type: {
        kind: 'struct';
        fields: [];
      };
    },
    {
      name: 'getRemoveLiquidityAmountAndFeeParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'lpAmountIn';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'getSwapAmountAndFeesParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amountIn';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'initParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'minSignatures';
            type: 'u8';
          },
          {
            name: 'allowSwap';
            type: 'bool';
          },
          {
            name: 'allowAddLiquidity';
            type: 'bool';
          },
          {
            name: 'allowRemoveLiquidity';
            type: 'bool';
          },
          {
            name: 'allowOpenPosition';
            type: 'bool';
          },
          {
            name: 'allowClosePosition';
            type: 'bool';
          },
          {
            name: 'allowPnlWithdrawal';
            type: 'bool';
          },
          {
            name: 'allowCollateralWithdrawal';
            type: 'bool';
          },
          {
            name: 'allowSizeChange';
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'liquidateParams';
      type: {
        kind: 'struct';
        fields: [];
      };
    },
    {
      name: 'multisig';
      serialization: 'bytemuck';
      repr: {
        kind: 'c';
        packed: true;
      };
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'numSigners';
            type: 'u8';
          },
          {
            name: 'numSigned';
            type: 'u8';
          },
          {
            name: 'minSignatures';
            type: 'u8';
          },
          {
            name: 'instructionAccountsLen';
            type: 'u8';
          },
          {
            name: 'instructionDataLen';
            type: 'u16';
          },
          {
            name: 'instructionHash';
            type: 'u64';
          },
          {
            name: 'signers';
            type: {
              array: ['pubkey', 6];
            };
          },
          {
            name: 'signed';
            type: {
              array: ['u8', 6];
            };
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'newPositionPricesAndFee';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'entryPrice';
            type: 'u64';
          },
          {
            name: 'liquidationPrice';
            type: 'u64';
          },
          {
            name: 'fee';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'openPositionParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'collateral';
            type: 'u64';
          },
          {
            name: 'size';
            type: 'u64';
          },
          {
            name: 'side';
            type: {
              defined: {
                name: 'side';
              };
            };
          },
          {
            name: 'takeProfitPrice';
            type: {
              option: 'u64';
            };
          },
          {
            name: 'stopLossPrice';
            type: {
              option: 'u64';
            };
          },
        ];
      };
    },
    {
      name: 'oracleParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'oracleAccount';
            type: 'pubkey';
          },
          {
            name: 'oracleType';
            type: {
              defined: {
                name: 'oracleType';
              };
            };
          },
          {
            name: 'oracleAuthority';
            type: 'pubkey';
          },
          {
            name: 'maxPriceError';
            type: 'u64';
          },
          {
            name: 'maxPriceAgeSec';
            type: 'u32';
          },
          {
            name: 'feedId';
            type: {
              array: ['u8', 32];
            };
          },
        ];
      };
    },
    {
      name: 'oracleType';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'none';
          },
          {
            name: 'custom';
          },
          {
            name: 'pyth';
          },
        ];
      };
    },
    {
      name: 'permissions';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'allowSwap';
            type: 'bool';
          },
          {
            name: 'allowAddLiquidity';
            type: 'bool';
          },
          {
            name: 'allowRemoveLiquidity';
            type: 'bool';
          },
          {
            name: 'allowOpenPosition';
            type: 'bool';
          },
          {
            name: 'allowClosePosition';
            type: 'bool';
          },
          {
            name: 'allowPnlWithdrawal';
            type: 'bool';
          },
          {
            name: 'allowCollateralWithdrawal';
            type: 'bool';
          },
          {
            name: 'allowSizeChange';
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'perpetuals';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'permissions';
            type: {
              defined: {
                name: 'permissions';
              };
            };
          },
          {
            name: 'pools';
            type: {
              vec: 'pubkey';
            };
          },
          {
            name: 'transferAuthorityBump';
            type: 'u8';
          },
          {
            name: 'perpetualsBump';
            type: 'u8';
          },
          {
            name: 'inceptionTime';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'pool';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'custodies';
            type: {
              vec: 'pubkey';
            };
          },
          {
            name: 'ratios';
            type: {
              vec: {
                defined: {
                  name: 'tokenRatios';
                };
              };
            };
          },
          {
            name: 'aumUsd';
            type: 'u128';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'lpTokenBump';
            type: 'u8';
          },
          {
            name: 'inceptionTime';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'position';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'owner';
            type: 'pubkey';
          },
          {
            name: 'pool';
            type: 'pubkey';
          },
          {
            name: 'custody';
            type: 'pubkey';
          },
          {
            name: 'collateralCustody';
            type: 'pubkey';
          },
          {
            name: 'openTime';
            type: 'i64';
          },
          {
            name: 'updateTime';
            type: 'i64';
          },
          {
            name: 'side';
            type: {
              defined: {
                name: 'side';
              };
            };
          },
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'sizeUsd';
            type: 'u64';
          },
          {
            name: 'borrowSizeUsd';
            type: 'u64';
          },
          {
            name: 'collateralUsd';
            type: 'u64';
          },
          {
            name: 'unrealizedProfitUsd';
            type: 'u64';
          },
          {
            name: 'unrealizedLossUsd';
            type: 'u64';
          },
          {
            name: 'cumulativeInterestSnapshot';
            type: 'u128';
          },
          {
            name: 'lockedAmount';
            type: 'u64';
          },
          {
            name: 'collateralAmount';
            type: 'u64';
          },
          {
            name: 'takeProfitPrice';
            type: {
              option: 'u64';
            };
          },
          {
            name: 'stopLossPrice';
            type: {
              option: 'u64';
            };
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'positionStats';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'openPositions';
            type: 'u64';
          },
          {
            name: 'collateralUsd';
            type: 'u64';
          },
          {
            name: 'sizeUsd';
            type: 'u64';
          },
          {
            name: 'borrowSizeUsd';
            type: 'u64';
          },
          {
            name: 'lockedAmount';
            type: 'u64';
          },
          {
            name: 'weightedPrice';
            type: 'u128';
          },
          {
            name: 'totalQuantity';
            type: 'u128';
          },
          {
            name: 'cumulativeInterestUsd';
            type: 'u64';
          },
          {
            name: 'cumulativeInterestSnapshot';
            type: 'u128';
          },
        ];
      };
    },
    {
      name: 'priceAndFee';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'fee';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'priceFeedMessage';
      repr: {
        kind: 'c';
      };
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'feedId';
            docs: [
              "`FeedId` but avoid the type alias because of compatibility issues with Anchor's `idl-build` feature.",
            ];
            type: {
              array: ['u8', 32];
            };
          },
          {
            name: 'price';
            type: 'i64';
          },
          {
            name: 'conf';
            type: 'u64';
          },
          {
            name: 'exponent';
            type: 'i32';
          },
          {
            name: 'publishTime';
            docs: ['The timestamp of this price update in seconds'];
            type: 'i64';
          },
          {
            name: 'prevPublishTime';
            docs: [
              'The timestamp of the previous price update. This field is intended to allow users to',
              'identify the single unique price update for any moment in time:',
              'for any time t, the unique update is the one such that prev_publish_time < t <= publish_time.',
              '',
              'Note that there may not be such an update while we are migrating to the new message-sending logic,',
              'as some price updates on pythnet may not be sent to other chains (because the message-sending',
              'logic may not have triggered). We can solve this problem by making the message-sending mandatory',
              '(which we can do once publishers have migrated over).',
              '',
              'Additionally, this field may be equal to publish_time if the message is sent on a slot where',
              'where the aggregation was unsuccesful. This problem will go away once all publishers have',
              'migrated over to a recent version of pyth-agent.',
            ];
            type: 'i64';
          },
          {
            name: 'emaPrice';
            type: 'i64';
          },
          {
            name: 'emaConf';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'priceUpdateV2';
      docs: [
        'A price update account. This account is used by the Pyth Receiver program to store a verified price update from a Pyth price feed.',
        'It contains:',
        '- `write_authority`: The write authority for this account. This authority can close this account to reclaim rent or update the account to contain a different price update.',
        '- `verification_level`: The [`VerificationLevel`] of this price update. This represents how many Wormhole guardian signatures have been verified for this price update.',
        '- `price_message`: The actual price update.',
        '- `posted_slot`: The slot at which this price update was posted.',
      ];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'writeAuthority';
            type: 'pubkey';
          },
          {
            name: 'verificationLevel';
            type: {
              defined: {
                name: 'verificationLevel';
              };
            };
          },
          {
            name: 'priceMessage';
            type: {
              defined: {
                name: 'priceFeedMessage';
              };
            };
          },
          {
            name: 'postedSlot';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'pricingParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'useEma';
            type: 'bool';
          },
          {
            name: 'useUnrealizedPnlInAum';
            type: 'bool';
          },
          {
            name: 'tradeSpreadLong';
            type: 'u64';
          },
          {
            name: 'tradeSpreadShort';
            type: 'u64';
          },
          {
            name: 'swapSpread';
            type: 'u64';
          },
          {
            name: 'minInitialLeverage';
            type: 'u64';
          },
          {
            name: 'maxInitialLeverage';
            type: 'u64';
          },
          {
            name: 'maxLeverage';
            type: 'u64';
          },
          {
            name: 'maxPayoffMult';
            type: 'u64';
          },
          {
            name: 'maxUtilization';
            type: 'u64';
          },
          {
            name: 'maxPositionLockedUsd';
            type: 'u64';
          },
          {
            name: 'maxTotalLockedUsd';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'profitAndLoss';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'profit';
            type: 'u64';
          },
          {
            name: 'loss';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'removeCollateralParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'collateralUsd';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'removeCustodyParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'ratios';
            type: {
              vec: {
                defined: {
                  name: 'tokenRatios';
                };
              };
            };
          },
        ];
      };
    },
    {
      name: 'removeLiquidityParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'lpAmountIn';
            type: 'u64';
          },
          {
            name: 'minAmountOut';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'removePoolParams';
      type: {
        kind: 'struct';
        fields: [];
      };
    },
    {
      name: 'setAdminSignersParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'minSignatures';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'setCustodyConfigParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'isStable';
            type: 'bool';
          },
          {
            name: 'isVirtual';
            type: 'bool';
          },
          {
            name: 'oracle';
            type: {
              defined: {
                name: 'oracleParams';
              };
            };
          },
          {
            name: 'pricing';
            type: {
              defined: {
                name: 'pricingParams';
              };
            };
          },
          {
            name: 'permissions';
            type: {
              defined: {
                name: 'permissions';
              };
            };
          },
          {
            name: 'fees';
            type: {
              defined: {
                name: 'fees';
              };
            };
          },
          {
            name: 'borrowRate';
            type: {
              defined: {
                name: 'borrowRateParams';
              };
            };
          },
          {
            name: 'ratios';
            type: {
              vec: {
                defined: {
                  name: 'tokenRatios';
                };
              };
            };
          },
        ];
      };
    },
    {
      name: 'setCustomOraclePriceParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'expo';
            type: 'i32';
          },
          {
            name: 'conf';
            type: 'u64';
          },
          {
            name: 'ema';
            type: 'u64';
          },
          {
            name: 'publishTime';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'setCustomOraclePricePermissionlessParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'custodyAccount';
            type: 'pubkey';
          },
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'expo';
            type: 'i32';
          },
          {
            name: 'conf';
            type: 'u64';
          },
          {
            name: 'ema';
            type: 'u64';
          },
          {
            name: 'publishTime';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'setPermissionsParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'allowSwap';
            type: 'bool';
          },
          {
            name: 'allowAddLiquidity';
            type: 'bool';
          },
          {
            name: 'allowRemoveLiquidity';
            type: 'bool';
          },
          {
            name: 'allowOpenPosition';
            type: 'bool';
          },
          {
            name: 'allowClosePosition';
            type: 'bool';
          },
          {
            name: 'allowPnlWithdrawal';
            type: 'bool';
          },
          {
            name: 'allowCollateralWithdrawal';
            type: 'bool';
          },
          {
            name: 'allowSizeChange';
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'setTestTimeParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'time';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'side';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'none';
          },
          {
            name: 'long';
          },
          {
            name: 'short';
          },
        ];
      };
    },
    {
      name: 'swapAmountAndFees';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amountOut';
            type: 'u64';
          },
          {
            name: 'feeIn';
            type: 'u64';
          },
          {
            name: 'feeOut';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'swapParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amountIn';
            type: 'u64';
          },
          {
            name: 'minAmountOut';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'tokenRatios';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'target';
            type: 'u64';
          },
          {
            name: 'min';
            type: 'u64';
          },
          {
            name: 'max';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'tradeStats';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'profitUsd';
            type: 'u64';
          },
          {
            name: 'lossUsd';
            type: 'u64';
          },
          {
            name: 'oiLongUsd';
            type: 'u64';
          },
          {
            name: 'oiShortUsd';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'twapPrice';
      docs: [
        'The time weighted average price & conf for a feed over the window [start_time, end_time].',
        'This type is used to persist the calculated TWAP in TwapUpdate accounts on Solana.',
      ];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'feedId';
            docs: [
              "`FeedId` but avoid the type alias because of compatibility issues with Anchor's `idl-build` feature.",
            ];
            type: {
              array: ['u8', 32];
            };
          },
          {
            name: 'startTime';
            type: 'i64';
          },
          {
            name: 'endTime';
            type: 'i64';
          },
          {
            name: 'price';
            type: 'i64';
          },
          {
            name: 'conf';
            type: 'u64';
          },
          {
            name: 'exponent';
            type: 'i32';
          },
          {
            name: 'downSlotsRatio';
            docs: [
              'Ratio out of 1_000_000, where a value of 1_000_000 represents',
              'all slots were missed and 0 represents no slots were missed.',
            ];
            type: 'u32';
          },
        ];
      };
    },
    {
      name: 'twapUpdate';
      docs: [
        'A time weighted average price account.',
        'This account is used by the Pyth Receiver program to store a TWAP update from a Pyth price feed.',
        'TwapUpdates can only be created after the client has verified the VAAs via the Wormhole contract.',
        'Check out `target_chains/solana/cli/src/main.rs` for an example of how to do this.',
        '',
        'It contains:',
        '- `write_authority`: The write authority for this account. This authority can close this account to reclaim rent or update the account to contain a different TWAP update.',
        '- `twap`: The actual TWAP update.',
      ];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'writeAuthority';
            type: 'pubkey';
          },
          {
            name: 'twap';
            type: {
              defined: {
                name: 'twapPrice';
              };
            };
          },
        ];
      };
    },
    {
      name: 'upgradeCustodyParams';
      type: {
        kind: 'struct';
        fields: [];
      };
    },
    {
      name: 'verificationLevel';
      docs: [
        'Pyth price updates are bridged to all blockchains via Wormhole.',
        'Using the price updates on another chain requires verifying the signatures of the Wormhole guardians.',
        'The usual process is to check the signatures for two thirds of the total number of guardians, but this can be cumbersome on Solana because of the transaction size limits,',
        'so we also allow for partial verification.',
        '',
        'This enum represents how much a price update has been verified:',
        '- If `Full`, we have verified the signatures for two thirds of the current guardians.',
        '- If `Partial`, only `num_signatures` guardian signatures have been checked.',
        '',
        '# Warning',
        'Using partially verified price updates is dangerous, as it lowers the threshold of guardians that need to collude to produce a malicious price update.',
      ];
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'partial';
            fields: [
              {
                name: 'numSignatures';
                type: 'u8';
              },
            ];
          },
          {
            name: 'full';
          },
        ];
      };
    },
    {
      name: 'volumeStats';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'swapUsd';
            type: 'u64';
          },
          {
            name: 'addLiquidityUsd';
            type: 'u64';
          },
          {
            name: 'removeLiquidityUsd';
            type: 'u64';
          },
          {
            name: 'openPositionUsd';
            type: 'u64';
          },
          {
            name: 'closePositionUsd';
            type: 'u64';
          },
          {
            name: 'liquidationUsd';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'withdrawFeesParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amount';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'withdrawSolFeesParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amount';
            type: 'u64';
          },
        ];
      };
    },
  ];
};
