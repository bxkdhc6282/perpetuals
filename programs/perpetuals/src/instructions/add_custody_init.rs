//! AddCustodyInit instruction handler

use {
    crate::{
        error::PerpetualsError,
        state::{
            custody::Custody,
            multisig::{AdminInstruction, Multisig},
            pool::{Pool, TokenRatios},
        },
    },
    anchor_lang::prelude::*,
    anchor_spl::token::{Mint, Token},
};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct AddCustodyInitParams {}

#[derive(Accounts)]
pub struct AddCustodyInit<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"multisig"],
        bump = multisig.load()?.bump
    )]
    pub multisig: AccountLoader<'info, Multisig>,

    #[account(
        mut,
        realloc = Pool::LEN + (pool.custodies.len() + 1) * std::mem::size_of::<Pubkey>() +
                              (pool.ratios.len() + 1) * std::mem::size_of::<TokenRatios>(),
        realloc::payer = admin,
        realloc::zero = false,
        // seeds = [b"pool",
        //          pool.name.as_bytes()],
        // bump = pool.bump
    )]
    pub pool: Box<Account<'info, Pool>>,

    #[account(
        init_if_needed,
        payer = admin,
        space = Custody::LEN,
        seeds = [b"custody",
                 pool.key().as_ref(),
                 custody_token_mint.key().as_ref()],
        bump
    )]
    pub custody: Box<Account<'info, Custody>>,

    #[account()]
    pub custody_token_mint: Box<Account<'info, Mint>>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}

pub fn add_custody_init<'info>(
    ctx: Context<'_, '_, '_, 'info, AddCustodyInit<'info>>,
    params: &AddCustodyInitParams,
) -> Result<u8> {
    // validate signatures
    let mut multisig = ctx.accounts.multisig.load_mut()?;

    let signatures_left = multisig.sign_multisig(
        &ctx.accounts.admin,
        &Multisig::get_account_infos(&ctx)[1..],
        &Multisig::get_instruction_data(AdminInstruction::AddCustody, &params)?,
    )?;
    if signatures_left > 0 {
        msg!(
            "Instruction has been signed but more signatures are required: {}",
            signatures_left
        );
        return Ok(signatures_left);
    }

    let pool = ctx.accounts.pool.as_mut();
    // record custody data
    let custody = ctx.accounts.custody.as_mut();

    custody.pool = pool.key();
    custody.mint = ctx.accounts.custody_token_mint.key();
    custody.bump = ctx.bumps.custody;

    if !custody.validate() {
        err!(PerpetualsError::InvalidCustodyConfig)
    } else {
        Ok(0)
    }
}
